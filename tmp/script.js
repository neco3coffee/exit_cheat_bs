// script.js

// --- 定数と変数の定義 ---
const TOTAL_NUMBERS = 37; // 0から36
const ROULETTE_ORDER = [ // ヨーロピアンルーレットの数字の並び
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];
const NUMBER_COLORS = { // 数字と色のマッピング (0は緑、その他は順次決定)
    0: 'green',
    // 他の数字は描画時に計算
};

// 色の定義
const COLOR_RED = '#d32f2f';
const COLOR_BLACK = '#212121';
const COLOR_GREEN = '#388e3c';
const COLOR_TEXT = '#ffffff';

let currentPoints = 1000;
const selectedNumber = 17; // デモ用に17で固定

// --- Canvas関連 ---
const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const outerRadius = canvas.width / 2 - 20; // 外側の半径
const innerRadius = 50; // 中央の円の半径

let wheelAngle = 0; // ルーレットホイールの現在の回転角度
let ballAngle = 0;  // ボールの現在の角度 (ホイールとは独立して動く)
let ballRadius = outerRadius - 15; // ボールが転がる半径
let spinning = false; // ルーレットが回転中かどうかのフラグ
let spinStartTime = 0; // スピン開始時刻

// アニメーションのパラメータ
const SPIN_DURATION_MS = 6000; // スピンの総時間 (6秒)
const TOTAL_SPINS = 7; // 最低回る周数
const DECELERATION_RATE = 0.0005; // 減速の強さ (小さいほど緩やか)

let targetWheelAngle = 0; // 最終的に停止するホイールの角度
let winningNumber = -1; // 当選番号

// --- DOM要素の取得 ---
const pointsDisplay = document.getElementById('current-points');
const betInput = document.getElementById('bet-amount');
const spinButton = document.getElementById('spin-button');
const winningNumberDisplay = document.getElementById('winning-number');
const payoutStatusDisplay = document.getElementById('payout-status');

// --- 初期化 ---
initRouletteColors();
drawRoulette();

// --- 関数 ---

/**
 * ルーレットの数字の色を定義する (0-36)
 * ヨーロピアンルーレットの配色パターンに基づきます。
 */
function initRouletteColors() {
    // 0は緑
    NUMBER_COLORS[0] = COLOR_GREEN;

    // 1-10: 奇数赤、偶数黒
    // 11-18: 奇数黒、偶数赤
    // 19-28: 奇数赤、偶数黒
    // 29-36: 奇数黒、偶数赤
    for (let i = 1; i <= 36; i++) {
        let isRed = false;
        if ((i >= 1 && i <= 10 && i % 2 !== 0) || (i >= 11 && i <= 18 && i % 2 === 0) || (i >= 19 && i <= 28 && i % 2 !== 0) || (i >= 29 && i <= 36 && i % 2 === 0)) {
            isRed = true;
        }
        NUMBER_COLORS[i] = isRed ? COLOR_RED : COLOR_BLACK;
    }
}

/**
 * ルーレットホイールを描画する
 */
function drawRoulette() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア

    // --- ルーレットの各セクターを描画 ---
    const arcAngle = (2 * Math.PI) / TOTAL_NUMBERS; // 1セクターあたりのラジアン角

    for (let i = 0; i < TOTAL_NUMBERS; i++) {
        const number = ROULETTE_ORDER[i];
        const startAngle = (i * arcAngle) + (wheelAngle * Math.PI / 180); // ホイールの回転を反映
        const endAngle = ((i + 1) * arcAngle) + (wheelAngle * Math.PI / 180);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = NUMBER_COLORS[number];
        ctx.fill();
        ctx.strokeStyle = '#333'; // セクター間の線
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- 数字を描画 ---
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + arcAngle / 2); // セクターの中央に回転
        ctx.textAlign = 'right';
        ctx.fillStyle = COLOR_TEXT;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(number.toString(), outerRadius - 15, 5); // 外周近くに数字
        ctx.restore();
    }

    // --- 中央の軸を描画 ---
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#666';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- ボールを描画 ---
    if (spinning) {
        ctx.beginPath();
        const ballX = centerX + Math.cos(ballAngle * Math.PI / 180) * ballRadius;
        const ballY = centerY + Math.sin(ballAngle * Math.PI / 180) * ballRadius;
        ctx.arc(ballX, ballY, 8, 0, 2 * Math.PI); // ボールのサイズ
        ctx.fillStyle = 'silver';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * 当選番号を受け取り、その番号がポインターの真下に停止するためのホイールの最終角度を計算する
 * (ホイールは時計回りに回転し、ポインターは上部中央にあると仮定)
 * @param {number} number - 当選した数字 (0-36)
 * @returns {number} 最終的にホイールが停止する角度 (度)
 */
function calculateFinalWheelAngle(number) {
    const index = ROULETTE_ORDER.indexOf(number);
    const degreePerNumber = 360 / TOTAL_NUMBERS;

    // 1. 当選番号のセクターの中心が、ルーレットのスタート位置（右端、0度）から反時計回りに進んだときの角度を計算
    const targetSectorCenterAngle = (index * degreePerNumber) + degreePerNumber / 2;

    // 2. ポインターの位置は上端（時計の12時、90度）なので、
    //    当選番号の中心を90度（上）に持ってくるために必要な回転量 (時計回り) を計算する。
    //    Canvasの回転系は時計回り (Cubic-Bezierアニメーションも時計回り)。
    //    360度基準の角度 (0-360) を使って計算します。
    //    360 - 角度 は、時計回りでの回転角度を意味します。
    let finalAngle = 360 - targetSectorCenterAngle;

    // 3. 描画とCSSのポインターのオフセット修正 (微調整)
    //    Canvasの円の中心を正確に90度に合わせるためのオフセット。
    //    描画の開始角度が「真横」なので、ポインターの「真上」に合わせるため、
    //    さらに90度のオフセット（または270度のオフセット）が必要になることがあります。
    //    Canvasは数学的座標系と異なり、上方向が270度、右方向が0度/360度です。
    //    ここでは、**描画オフセットを相殺するために90度時計回りにずらす**（-90度）ことで修正します。
    finalAngle = (finalAngle + 90) % 360;

    // 4. 最低回る周数分を追加し、アニメーションを確実にする
    finalAngle += (TOTAL_SPINS * 360);

    // 5. 現在の回転角度を考慮して、新しい回転角度を計算
    const newRotation = finalAngle + wheelAngle;

    return newRotation;
}

/**
 * アニメーションループ
 * @param {DOMHighResTimeStamp} currentTime
 */
function animateRoulette(currentTime) {
    if (!spinning) return;

    const elapsedTime = currentTime - spinStartTime;

    // ホイールの回転
    let progress = Math.min(elapsedTime / SPIN_DURATION_MS, 1);

    // 回転速度の計算 (徐々に減速するイージング関数)
    // easeOutQuad: 1 - (1 - x) * (1 - x)
    const easedProgress = 1 - (1 - progress) * (1 - progress);

    // ホイールの角度を更新
    wheelAngle = easedProgress * targetWheelAngle;

    // ボールの回転 (ホイールとは逆方向に、少し速めに回転させる)
    // ボールは初期は速く、徐々にホイールと同じ速度になり、最終的にホイールのポケットに落ちる
    let ballSpeedFactor = 1.0; // ボールの相対速度
    if (progress < 0.8) { // スピンの大部分で速く回る
        ballSpeedFactor = 1.2 - (progress * 0.4); // 徐々に減速
    } else { // 停止間際でホイールに追いつき、ポケットに落ちる
        ballSpeedFactor = 0.8; // ホイールより少し遅れて、ポケットに入る
    }

    ballAngle = (wheelAngle * ballSpeedFactor) % 360; // ボールはホイールとは別の速度で回る

    drawRoulette();

    if (progress < 1) {
        requestAnimationFrame(animateRoulette);
    } else {
        // スピン終了
        spinning = false;
        spinButton.disabled = false;

        // 最終的なボールの位置調整 (当選番号のポケットに「落ちた」ように見せる)
        // ここでボールの最終的な位置を調整して、当選番号のセクターに固定します。
        const winningIndex = ROULETTE_ORDER.indexOf(winningNumber);
        const winningSectorCenterAngle = (winningIndex * (360 / TOTAL_NUMBERS)) + (360 / TOTAL_NUMBERS) / 2;

        // ポインターが上にあるので、ホイールの最終停止角度から逆算してボールの角度を設定
        // ポインターの真下に来る数字の角度 - ホイールの回転角度
        const currentWheelRotationAtZero = wheelAngle % 360; // 0-360に正規化

        // 最終的にボールが止まるべき絶対角度 (ポインターの方向)
        // この計算は少し複雑になりますが、簡略化のため、
        // ボールはポインターの真下のセクターに「吸い込まれる」ように描画します。
        // drawRoulette()のballAngleはまだ停止時のものではないので、
        // ボールを非表示にして結果を表示します。

        // 結果表示
        winningNumberDisplay.textContent = winningNumber;
        let payout = 0;
        let resultMessage = '';

        if (winningNumber === selectedNumber) {
            payout = betInput.value * 36;
            currentPoints += payout;
            resultMessage = `🎉 当たり！ ${payout} P 獲得！`;
        } else {
            payout = -betInput.value;
            currentPoints += payout;
            resultMessage = `残念... ${betInput.value} P 損失。`;
        }
        pointsDisplay.textContent = currentPoints;
        payoutStatusDisplay.textContent = resultMessage;
    }
}


// --- イベントリスナー ---
spinButton.addEventListener('click', () => {
    const betAmount = parseInt(betInput.value);

    if (betAmount <= 0 || isNaN(betAmount) || betAmount > currentPoints) {
        alert('有効な賭けポイントを入力してください！');
        return;
    }

    if (spinning) return; // スピン中は再度クリックできないように

    // ゲーム開始前の処理
    currentPoints -= betAmount;
    pointsDisplay.textContent = currentPoints;
    spinButton.disabled = true;
    winningNumberDisplay.textContent = '--';
    payoutStatusDisplay.textContent = '回転中...';

    // 当選番号を決定
    winningNumber = ROULETTE_ORDER[Math.floor(Math.random() * TOTAL_NUMBERS)];

    // 最終停止角度を計算
    targetWheelAngle = calculateFinalWheelAngle(winningNumber);

    // アニメーション開始
    spinning = true;
    spinStartTime = performance.now();
    requestAnimationFrame(animateRoulette);
});

// 初期描画
drawRoulette();
