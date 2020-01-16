class Tetris {
  constructor() {
    const ctx = canvas.getContext('2d');
    const matrix = [
      // 'ㅜ' shape
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
    // shapes: I, L, ㄱ, T, ㅁ, ㄹ
    const player = {
      pos: { x: 5, y: 5 },
      matrix: matrix,
    };

    let lastTime = 0;
    let dropCounter = 0;
    let dropInterval = 1000;

    Object.assign(this, {
      ctx,
      matrix,
      player,
      lastTime,
      dropCounter,
      dropInterval,
    });

    ctx.scale(20, 20);

    this.update();
    this.keydown();
  }

  keydown() {
    document.addEventListener('keydown', this.keydownHandler.bind(this), false);
  }

  keydownHandler(e) {
    const { player, dropCounter } = this;

    if (e.which == 37) {
      player.pos.x--;
    } else if (e.which == 39) {
      player.pos.x++;
    } else if (e.which == 40) {
      this.playerDrop();
    }
  }

  playerDrop() {
    const { player } = this;

    player.pos.y++;
    this.dropCounter = 0;
  }

  update(time = 0) {
    const { player, lastTime, dropCounter, dropInterval } = this;
    const daltaTime = time - this.lastTime;

    this.lastTime = time;
    this.dropCounter += daltaTime;
    // console.log(daltaTime);
    if (dropCounter > dropInterval) {
      this.playerDrop();
    }

    this.draw();
    window.requestAnimationFrame(this.update.bind(this));
  }

  draw() {
    const { ctx, player } = this;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.drawMatrix(player.matrix, player.pos);
  }

  drawMatrix(matrix, offset) {
    const { ctx } = this;

    // console.log(matrix, offset);
    matrix.forEach((row, y) => {
      // console.log(row, y);
      row.forEach((value, x) => {
        // console.log(value, x);
        if (value !== 0) {
          ctx.fillStyle = 'red';
          ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }
}

const canvas = document.getElementById('canvas');
const tetris = new Tetris(canvas);

/*
  로직
  - shape 각각 만들기 (총 7개)
  - canvas 테두리 그리기
  - canvas shape 타입 및 위치 세팅하여 그리기
  - 키보드 방향키로 shape 이동 시키기.
  - 아래 방향으로 shape 5초 간격으로 이동 시키기.
  - shape 가 canvas 좌/우, 하단 도달했을 경우 체크하여 처리하기.

  블럭 7개,
  마지막 단계(last), 최소 속도(min), 최대 속도(max)
  점수,
  블럭 미리보기,
*/
