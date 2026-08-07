(function () {
  const config = window.MAYOUSA_LEADERBOARD || {};
  const supabaseUrl = String(config.supabaseUrl || "").replace(/\/+$/, "");
  const supabaseAnonKey = String(config.supabaseAnonKey || "");
  const table = String(config.table || "mayousa_scores");
  const isOnline = !!(supabaseUrl && supabaseAnonKey);
  const localKey = "mayousaLocalScores";

  const els = {
    actions: document.getElementById("resultActions"),
    latestScore: document.getElementById("latestScore"),
    playerName: document.getElementById("playerName"),
    submit: document.getElementById("submitScore"),
    share: document.getElementById("shareScore"),
    message: document.getElementById("resultMessage"),
    list: document.getElementById("rankingList"),
    status: document.getElementById("rankingStatus"),
    refresh: document.getElementById("rankingRefresh"),
  };

  let latestResult = null;
  let submittedRunId = "";

  function setStatus(text) {
    if (els.status) els.status.textContent = text;
  }

  function setMessage(text) {
    if (els.message) els.message.textContent = text;
  }

  function normalizeName(value) {
    const name = String(value || "").trim().replace(/\s+/g, " ").slice(0, 16);
    return name || "まようさ";
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function makeRecord(result, name) {
    return {
      player_name: normalizeName(name),
      score: result.score,
      completed_at: result.completedAt,
      lives: result.lives,
      end_id: result.endId,
      title: result.title,
      scene_name: result.sceneName,
    };
  }

  async function requestSupabase(path, options = {}) {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || `Request failed: ${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  function readLocalScores() {
    try {
      const rows = JSON.parse(localStorage.getItem(localKey) || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }

  function writeLocalScore(record) {
    const rows = [record, ...readLocalScores()]
      .sort((a, b) => b.score - a.score || new Date(a.completed_at) - new Date(b.completed_at))
      .slice(0, 20);
    localStorage.setItem(localKey, JSON.stringify(rows));
    return rows;
  }

  async function fetchScores() {
    if (!isOnline) {
      return readLocalScores()
        .sort((a, b) => b.score - a.score || new Date(a.completed_at) - new Date(b.completed_at))
        .slice(0, 10);
    }
    const query = `${encodeURIComponent(table)}?select=player_name,score,completed_at,lives,end_id,title,scene_name&order=score.desc,completed_at.asc&limit=10`;
    return requestSupabase(query, { method: "GET", headers: { Prefer: "" } });
  }

  async function submitScore() {
    if (!latestResult) return;
    if (!latestResult.cleared) {
      setMessage("クリア時のみランキング登録できます。");
      return;
    }
    if (submittedRunId === latestResult.runId) {
      setMessage("この結果は登録済みです。");
      return;
    }
    const record = makeRecord(latestResult, els.playerName.value);
    els.submit.disabled = true;
    setMessage("登録中...");
    try {
      if (isOnline) {
        await requestSupabase(encodeURIComponent(table), {
          method: "POST",
          body: JSON.stringify(record),
        });
      } else {
        writeLocalScore(record);
      }
      submittedRunId = latestResult.runId;
      localStorage.setItem("mayousaPlayerName", record.player_name);
      setMessage(isOnline ? "ランキングに登録しました。" : "ローカルランキングに登録しました。");
      await renderRanking();
    } catch (error) {
      console.error(error);
      setMessage("登録に失敗しました。設定を確認してください。");
    } finally {
      els.submit.disabled = false;
    }
  }

  function shareScore() {
    if (!latestResult) return;
    const url = new URL("https://twitter.com/intent/tweet");
    const text = latestResult.cleared
      ? `まようさスクロールゲームをクリア！ SCORE ${latestResult.score} / ${latestResult.lives}羽到着`
      : `まようさスクロールゲームに挑戦！ SCORE ${latestResult.score}`;
    url.searchParams.set("text", `${text}\n#mayousa_late_run`);
    url.searchParams.set("url", location.href.split("#")[0]);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  function renderRows(rows) {
    els.list.innerHTML = "";
    rows.forEach((row, index) => {
      const li = document.createElement("li");
      const rank = document.createElement("div");
      const body = document.createElement("div");
      const name = document.createElement("div");
      const meta = document.createElement("div");
      const score = document.createElement("div");

      rank.className = "rank-num";
      name.className = "rank-name";
      meta.className = "rank-date";
      score.className = "rank-score";

      rank.textContent = `#${index + 1}`;
      name.textContent = row.player_name || "まようさ";
      meta.textContent = `${formatDate(row.completed_at)} ${row.lives || 0}羽`;
      score.textContent = String(row.score || 0);

      body.append(name, meta);
      li.append(rank, body, score);
      els.list.appendChild(li);
    });
  }

  async function renderRanking() {
    setStatus("ランキング読込中...");
    try {
      const rows = await fetchScores();
      renderRows(rows);
      if (rows.length === 0) {
        setStatus(isOnline ? "まだ登録がありません。" : "オンラインランキング未接続。現在はこの端末だけの仮ランキングです。");
      } else {
        setStatus(isOnline ? "" : "オンラインランキング未接続。現在はこの端末だけの仮ランキングです。");
      }
    } catch (error) {
      console.error(error);
      renderRows([]);
      setStatus("ランキングを読み込めませんでした。");
    }
  }

  function showResultActions(result) {
    latestResult = result;
    els.actions.hidden = false;
    els.latestScore.textContent = String(result.score);
    els.submit.disabled = !result.cleared;
    const savedName = localStorage.getItem("mayousaPlayerName");
    if (savedName && !els.playerName.value) els.playerName.value = savedName;
    setMessage(result.cleared ? "名前を入れてランキング登録できます。" : "クリア時のみランキング登録できます。");
  }

  els.refresh.addEventListener("click", renderRanking);
  els.submit.addEventListener("click", submitScore);
  els.share.addEventListener("click", shareScore);
  window.addEventListener("mayousa:result", (event) => showResultActions(event.detail));

  renderRanking();
})();
