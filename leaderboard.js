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
    mayousaPicker: document.getElementById("mayousaPicker"),
    shareMayousa: document.getElementById("shareMayousa"),
    submit: document.getElementById("submitScore"),
    share: document.getElementById("shareScore"),
    shareImage: document.getElementById("shareImageScore"),
    imagePreview: document.getElementById("resultImagePreview"),
    resultImage: document.getElementById("resultImage"),
    message: document.getElementById("resultMessage"),
    list: document.getElementById("rankingList"),
    status: document.getElementById("rankingStatus"),
    refresh: document.getElementById("rankingRefresh"),
  };

  let latestResult = null;
  let submittedRunId = "";
  const mayousaShareData = {
    hat: { name: "まようさハット", src: "assets/player/mayousa_hat.png" },
    glasses: { name: "まようさグラサン", src: "assets/player/mayousa_glasses.png" },
    flower: { name: "まようさおはな", src: "assets/player/mayousa_flower.png" },
    apple: { name: "まようさりんご", src: "assets/player/mayousa_apple.png" },
    ribbon: { name: "まようさりぼん", src: "assets/player/mayousa_ribbon.png" },
  };

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
      favorite_mayousa: els.shareMayousa?.value || "hat",
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

  function dedupeBestByName(rows, limit = 30) {
    const best = new Map();
    rows.forEach((row) => {
      const key = normalizeName(row.player_name).toLowerCase();
      const current = best.get(key);
      const rowTime = new Date(row.completed_at).getTime() || 0;
      const currentTime = current ? new Date(current.completed_at).getTime() || 0 : 0;
      if (
        !current ||
        row.score > current.score ||
        (row.score === current.score && rowTime < currentTime)
      ) {
        best.set(key, row);
      }
    });
    return Array.from(best.values())
      .sort((a, b) => b.score - a.score || new Date(a.completed_at) - new Date(b.completed_at))
      .slice(0, limit);
  }

  function writeLocalScore(record) {
    const rows = dedupeBestByName([record, ...readLocalScores()], 30);
    localStorage.setItem(localKey, JSON.stringify(rows));
    return rows;
  }

  async function fetchScores() {
    if (!isOnline) {
      return dedupeBestByName(readLocalScores(), 30);
    }
    const query = `${encodeURIComponent(table)}?select=player_name,score,completed_at,lives,end_id,title,scene_name,favorite_mayousa&order=score.desc,completed_at.asc&limit=200`;
    const rows = await requestSupabase(query, { method: "GET", headers: { Prefer: "" } });
    return dedupeBestByName(rows, 30);
  }

  async function fetchBestScoreForName(playerName) {
    const name = normalizeName(playerName);
    if (!isOnline) {
      const rows = readLocalScores().filter((row) => normalizeName(row.player_name) === name);
      return rows.reduce((max, row) => Math.max(max, Number(row.score) || 0), -1);
    }
    const query = `${encodeURIComponent(table)}?select=score&player_name=eq.${encodeURIComponent(name)}&order=score.desc&limit=1`;
    const rows = await requestSupabase(query, { method: "GET", headers: { Prefer: "" } });
    return rows && rows[0] ? Number(rows[0].score) || 0 : -1;
  }

  async function submitScore() {
    if (!latestResult) return;
    if (latestResult.testMode) {
      setMessage("テストモードの結果はランキング登録できません。");
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
      const bestScore = await fetchBestScoreForName(record.player_name);
      if (bestScore >= record.score) {
        setMessage(`同じ名前の最高SCORE ${bestScore} を超えた時だけ登録できます。`);
        return;
      }
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
    const selected = mayousaShareData[els.shareMayousa?.value] || mayousaShareData.hat;
    const lines = [
      "#Late_Runner",
      "#ミュージカルwishクレールドルナ",
      `あなたのSCORE【 ${latestResult.score} 】`,
      `到達シーン【${latestResult.sceneName || "開演前"}】`,
      `推しまようさ【${selected.name}】`,
      "次回公演をお楽しみに！",
    ];
    url.searchParams.set("text", lines.join("\n"));
    url.searchParams.set("url", location.href.split("#")[0]);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  async function createResultCardDataUrl() {
    const selected = mayousaShareData[els.shareMayousa?.value] || mayousaShareData.hat;
    const image = await loadImage(selected.src);
    const isTrueEnd = !!latestResult.isTrueEnd;
    const card = document.createElement("canvas");
    card.width = 1200;
    card.height = 675;
    const c = card.getContext("2d");
    const grad = c.createLinearGradient(0, 0, 1200, 675);
    grad.addColorStop(0, "#101318");
    grad.addColorStop(0.55, "#241d2a");
    grad.addColorStop(1, "#3a2830");
    c.fillStyle = grad;
    c.fillRect(0, 0, 1200, 675);

    c.fillStyle = "rgba(255, 223, 131, 0.12)";
    c.fillRect(56, 56, 1088, 563);
    c.strokeStyle = "rgba(255, 223, 131, 0.55)";
    c.lineWidth = 4;
    c.strokeRect(56, 56, 1088, 563);

    c.fillStyle = "#ffdf83";
    c.font = "800 48px sans-serif";
    c.fillText("#Late_Runner", 92, 122);
    c.font = "700 30px sans-serif";
    c.fillText("#ミュージカルwishクレールドルナ", 92, 166);
    c.fillStyle = "#ffffff";
    c.font = "800 84px sans-serif";
    c.fillText(isTrueEnd ? "True End" : "Result", 92, 255);
    c.font = "900 72px sans-serif";
    c.fillText(`SCORE ${latestResult.score}`, 92, 345);
    c.font = "700 30px sans-serif";
    c.fillStyle = "#f7f1df";
    c.fillText(`到達シーン: ${latestResult.sceneName || "開演前"}`, 92, 395);
    c.fillText(`称号: ${latestResult.title || "まようさ遅刻中"}`, 92, 435);
    c.fillText(`推しまようさ: ${selected.name}`, 92, 475);

    c.fillStyle = "rgba(255, 223, 131, 0.16)";
    c.fillRect(84, 505, 612, 82);
    c.strokeStyle = "rgba(255, 223, 131, 0.42)";
    c.lineWidth = 2;
    c.strokeRect(84, 505, 612, 82);
    c.fillStyle = "#ffdf83";
    c.font = "800 28px sans-serif";
    c.fillText("次回公演日程", 110, 538);
    c.fillStyle = "#ffffff";
    c.font = "800 34px sans-serif";
    c.fillText("8/22・23　9/12・19", 110, 576);
    c.fillStyle = "#f7f1df";
    c.font = "700 24px sans-serif";
    c.fillText("会場: cluster　開場21:45 / 開演22:00〜", 92, 616);

    const size = 360;
    const x = 760;
    const y = 205;
    c.fillStyle = "rgba(255, 255, 255, 0.12)";
    c.beginPath();
    c.arc(x + size / 2, y + size / 2, 190, 0, Math.PI * 2);
    c.fill();
    c.drawImage(image, x, y, size, size);

    c.fillStyle = "rgba(255, 255, 255, 0.66)";
    c.font = "600 20px sans-serif";
    c.fillText(location.hostname, 92, 646);

    return card.toDataURL("image/png");
  }

  async function shareImageScore() {
    if (!latestResult) return;
    els.shareImage.disabled = true;
    setMessage("画像を作成中...");
    try {
      const dataUrl = await createResultCardDataUrl();
      els.resultImage.src = dataUrl;
      els.imagePreview.hidden = false;
      setMessage("リザルト画像を表示しました。保存してポストに添付できます。");
    } catch (error) {
      console.error(error);
      setMessage("画像作成に失敗しました。通常ポストを使ってください。");
    } finally {
      els.shareImage.disabled = false;
    }
  }

  function renderRows(rows) {
    els.list.innerHTML = "";
    rows.forEach((row, index) => {
      const li = document.createElement("li");
      const rank = document.createElement("div");
      const icon = document.createElement("img");
      const body = document.createElement("div");
      const name = document.createElement("div");
      const meta = document.createElement("div");
      const score = document.createElement("div");
      const favorite = mayousaShareData[row.favorite_mayousa] || mayousaShareData.hat;

      rank.className = "rank-num";
      icon.className = "rank-icon";
      name.className = "rank-name";
      meta.className = "rank-date";
      score.className = "rank-score";

      rank.textContent = `#${index + 1}`;
      icon.src = favorite.src;
      icon.alt = favorite.name;
      name.textContent = row.player_name || "まようさ";
      meta.textContent = `${formatDate(row.completed_at)} ${row.lives || 0}羽`;
      score.textContent = String(row.score || 0);

      body.append(name, meta);
      li.append(rank, icon, body, score);
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
    els.submit.disabled = !!result.testMode || !!result.isTrueEnd;
    els.mayousaPicker.hidden = false;
    els.shareImage.hidden = false;
    els.imagePreview.hidden = true;
    els.resultImage.removeAttribute("src");
    const savedName = localStorage.getItem("mayousaPlayerName");
    if (savedName && !els.playerName.value) els.playerName.value = savedName;
    if (result.testMode) {
      setMessage("テストモードの結果はランキング登録できません。");
    } else if (result.isTrueEnd) {
      setMessage("好きなまようさを選んでTrue Endをポストできます。");
    } else {
      setMessage("名前と推しまようさを選んでランキング登録・画像共有できます。");
    }
  }

  els.refresh.addEventListener("click", renderRanking);
  els.submit.addEventListener("click", submitScore);
  els.share.addEventListener("click", shareScore);
  els.shareImage.addEventListener("click", shareImageScore);
  window.addEventListener("mayousa:result", (event) => showResultActions(event.detail));

  renderRanking();
})();
