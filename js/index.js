import BLOCKS from './blocks.js';

////////////////////// DOM //////////////////////
const playground = document.querySelector('.playground > ul');
const gameText = document.querySelector('.game-text');
const scoreDisplay = document.querySelector('.score');
const restartButton = document.querySelector('.game-text > button');

////////////////////// Setting //////////////////////
const GAME_ROWS = 20;
const GAME_COLS = 10;

////////////////////// variables //////////////////////
let score = 0;
let duration = 500;
let downInterval;
// 바로 다음 블럭
let tempMovingItem;

// 다음 블럭의 정보(변수 BLOCKS 참조)
const movingItem = {
  type: '',
  direction: 0, //block의 회전값(0~4)
  top: 0,
  left: 3,
};

//////////////////////////////////////////////////////

init();

////////////////////// functions //////////////////////
// 10x20의 playground(matrix)생성
function init() {
  tempMovingItem = { ...movingItem };

  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine();
  }

  generateNewBlock();
}

// playground에 10칸짜리 한 줄 추가
function prependNewLine() {
  const li = document.createElement('li');
  const ul = document.createElement('ul');
  for (let j = 0; j < GAME_COLS; j++) {
    const matrix = document.createElement('li');
    ul.prepend(matrix);
  }
  li.prepend(ul);
  playground.prepend(li);
}

// 블럭 렌더링(tempMovingItem을 렌더링)
function renderBlocks(moveType = '') {
  const { type, direction, top, left } = tempMovingItem;
  const movingBlocks = document.querySelectorAll('.moving');
  movingBlocks.forEach((item) => {
    item.classList.remove(type, 'moving');
  });
  BLOCKS[type][direction].some((block) => {
    const x = block[0] + left;
    const y = block[1] + top;
    const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
    const isAvailable = checkEmpty(target);
    // 블럭시 playground의 범위를 벗어나지 않았으면
    if (isAvailable) {
      target.classList.add(type, 'moving');
    } else {
      // 벗어났으면 이전 블럭으로 복구하고, 다시 렌더링..을 할 껀데
      // 재귀함수 콜스택 오류때문에 setTimeout으로 비동기적으로 처리해줌
      tempMovingItem = { ...movingItem };
      if (moveType === 'retry') {
        clearInterval(downInterval);
        showGameoverText();
      }
      setTimeout(() => {
        renderBlocks('retry');
        if (moveType === 'top') {
          seizeBlock();
        }
      }, 0);
      return true;
    }
  });
  movingItem.left = left;
  movingItem.top = top;
  movingItem.direction = direction;
}

function showGameoverText() {
  //gameText의 디스플레이 flex로 바꾸기
  gameText.style.display = 'flex';
}

// 블럭이 맨 아래에 닿을 경우 고정
function seizeBlock() {
  console.log('sezie block');
  const movingBlocks = document.querySelectorAll('.moving');
  movingBlocks.forEach((item) => {
    item.classList.remove('moving');
    item.classList.add('seized');
  });
  checkMatch();
}

// 한 줄 완성이면 지우기
function checkMatch() {
  const childNodes = playground.childNodes;
  childNodes.forEach((child) => {
    let matched = true;
    child.childNodes[0].childNodes.forEach((li) => {
      if (!li.classList.contains('seized')) {
        matched = false;
      }
    });
    if (matched) {
      child.remove();
      prependNewLine();
      score++;
      scoreDisplay.innerText = score;
    }
  });

  generateNewBlock();
}

// 새로운 블럭 생성
function generateNewBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock('top', 1);
  }, duration);

  const itemType = ['square', 'bar', 'tree', 'zee', 'elLeft', 'elRight'];
  movingItem.type = itemType[Math.floor(Math.random() * itemType.length)];
  console.log(movingItem.type);

  movingItem.top = 0;
  movingItem.left = 3;
  movingItem.direction = 0;
  tempMovingItem = { ...movingItem };

  renderBlocks();
}

// 블럭이 playground의 범위를 벗어났나요?
function checkEmpty(target) {
  if (!target || target.classList.contains('seized')) {
    return false;
  }
  return true;
}

// 블럭 위치 옮기기
function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount;
  renderBlocks(moveType);
}

// 블럭 회전하기
function changeDirection() {
  const direction = tempMovingItem.direction;
  direction === 3 ? (tempMovingItem.direction = 0) : (tempMovingItem.direction += 1);
  renderBlocks();
}

// 블럭 한 번에 내리기
function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock('top', 1);
  }, 10);
}

// event handling
document.addEventListener('keydown', (e) => {
  console.log(e.keyCode);
  switch (e.keyCode) {
    case 39: //right
      moveBlock('left', 1);
      break;
    case 37: //left
      moveBlock('left', -1);
      break;
    case 40: //down
      moveBlock('top', 1);
      break;
    case 38: //change direction
      changeDirection();
      break;
    case 32:
      dropBlock();
    default:
      break;
  }
});

// 버튼 클릭시 재시작
restartButton.addEventListener('click', () => {
  playground.innerHTML = '';
  gameText.style.display = 'none';
  init();
});
