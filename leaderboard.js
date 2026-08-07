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
    message: document.getElementById("resultMessage"),
    list: document.getElementById("rankingList"),
    status: document.getElementById("rankingStatus"),
    refresh: document.getElementById("rankingRefresh"),
  };

  let latestResult = null;
  let submittedRunId = "";
  const mayousaShareData = {
    hat: { name: "ハットまようさ", src: "assets/player/mayousa_hat.png" },
    glasses: { name: "グラサンまようさ", src: "assets/player/mayousa_glasses.png" },
    flower: { name: "おはなまようさ", src: "assets/player/mayousa_flower.png" },
    apple: { name: "りんごまようさ", src: "assets/player/mayousa_apple.png" },
    ribbon: { name: "りぼんまようさ", src: "assets/player/mayousa_ribbon.png" },
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
    if (latestResult.testMode) {
      setMessage("テストモードの結果はランキング登録できません。");
      return;
    }
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
    const selected = mayousaShareData[els.shareMayousa?.value] || mayousaShareData.hat;
    const lines = [
      "#Late_Runner",
      `あなたのSCORE【 ${latestResult.score} 】`,
      `到達シーン【${latestResult.sceneName || "開演前"}】`,
      `称号【${latestResult.title || "まようさ遅刻中"}】`,
      ...(latestResult.isTrueEnd ? [`推しまようさ【${selected.name}】`] : []),
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

  function canvasToBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  async function createTrueEndCardFile() {
    const selected = mayousaShareData[els.shareMayousa?.value] || mayousaShareData.hat;
    const image = await loadImage(selected.src);
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
    c.font = "700 46px sans-serif";
    c.fillText("#Late_Runner", 92, 128);
    c.fillStyle = "#ffffff";
    c.font = "800 84px sans-serif";
    c.fillText("True End", 92, 236);
    c.font = "800 64px sans-serif";
    c.fillText(`SCORE ${latestResult.score}`, 92, 326);
    c.font = "700 34px sans-serif";
    c.fillStyle = "#f7f1df";
    c.fillText(`推しまようさ: ${selected.name}`, 92, 390);
    c.fillText("次回公演をお楽しみに！", 92, 448);

    const size = 360;
    const x = 760;
    const y = 205;
    c.fillStyle = "rgba(255, 255, 255, 0.12)";
    c.beginPath();
    c.arc(x + size / 2, y + size / 2, 190, 0, Math.PI * 2);
    c.fill();
    c.drawImage(image, x, y, size, size);

    c.fillStyle = "rgba(255, 255, 255, 0.76)";
    c.font = "600 24px sans-serif";
    c.fillText(location.hostname, 92, 570);

    const blob = await canvasToBlob(card);
    return new File([blob], "late-runner-true-end.png", { type: "image/png" });
  }

  async function shareImageScore() {
    if (!latestResult) return;
    if (!latestResult.isTrueEnd) {
      shareScore();
      return;
    }
    els.shareImage.disabled = true;
    setMessage("画像を作成中...");
    try {
      const file = await createTrueEndCardFile();
      const selected = mayousaShareData[els.shareMayousa?.value] || mayousaShareData.hat;
      const text = [
        "#Late_Runner",
        `あなたのSCORE【 ${latestResult.score} 】`,
        "到達シーン【True End】",
        `推しまようさ【${selected.name}】`,
        "次回公演をお楽しみに！",
      ].join("\n");
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], text, url: location.href.split("#")[0] });
        setMessage("共有画面を開きました。");
      } else {
        const downloadUrl = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(downloadUrl);
        setMessage("画像を保存しました。ポスト画面で添付してください。");
        shareScore();
      }
    } catch (error) {
      console.error(error);
      setMessage("画像つき共有に失敗しました。通常ポストを使ってください。");
    } finally {
      els.shareImage.disabled = false;
    }
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
    els.submit.disabled = !result.cleared || !!result.testMode || !!result.isTrueEnd;
    els.mayousaPicker.hidden = !result.isTrueEnd;
    els.shareImage.hidden = !result.isTrueEnd;
    const savedName = localStorage.getItem("mayousaPlayerName");
    if (savedName && !els.playerName.value) els.playerName.value = savedName;
    if (result.testMode) {
      setMessage("テストモードの結果はランキング登録できません。");
    } else if (result.isTrueEnd) {
      setMessage("好きなまようさを選んでTrue Endをポストできます。");
    } else {
      setMessage(result.cleared ? "名前を入れてランキング登録できます。" : "クリア時のみランキング登録できます。");
    }
  }

  els.refresh.addEventListener("click", renderRanking);
  els.submit.addEventListener("click", submitScore);
  els.share.addEventListener("click", shareScore);
  els.shareImage.addEventListener("click", shareImageScore);
  window.addEventListener("mayousa:result", (event) => showResultActions(event.detail));

  renderRanking();
})();
