class Tetris {
  constructor() {
    const ctx = canvas.getContext('2d');
    const matrix = [
      // 'ㅜ' shape
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
    const arena = this.createMatrix(12, 20);
    const player = {
      pos: { x: 5, y: 0 },
      matrix: matrix,
    };

    let lastTime = 0;
    let dropCounter = 0;
    let dropInterval = 1000;

    Object.assign(this, {
      ctx,
      matrix,
      arena,
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
      this.playerMove(-1);
    } else if (e.which == 39) {
      this.playerMove(1);
    } else if (e.which == 40) {
      this.playerDrop();
    } else if (e.which == 81) {
      this.playerRotate(-1);
    } else if (e.which == 87) {
      this.playerRotate(1);
    }
  }

  merge(arena, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  }

  playerDrop() {
    const { arena, player } = this;

    player.pos.y++;
    if (this.collide(arena, player)) {
      player.pos.y--;
      this.merge(arena, player);
      player.pos.y = 0;
      console.table(arena);
    }
    this.dropCounter = 0;
  }

  playerMove(dir) {
    const { arena, player } = this;

    player.pos.x += dir;
    if (this.collide(arena, player)) {
      player.pos.x -= dir;
    }
  }

  playerRotate(dir) {
    const { player } = this;

    this.rotate(player.matrix, dir);
    // 회전 시 옆면 방지..
    console.log(player.pos.x);
  }

  rotate(matrix, dir) {
    console.log(matrix, dir);
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [
          matrix[x][y],
          matrix[y][x],
        ] = [
          matrix[y][x],
          matrix[x][y],
        ];
      }
    }

    if (dir > 0) {
      // 왼쪽 회전
      matrix.forEach(row => row.reverse());
    } else {
      // 오른쪽 회전
      matrix.reverse();
    }
    // transpose(위치 바꿈) + reverse(뒤집다) = rotate(회전)
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
    requestAnimationFrame(this.update.bind(this));
  }

  collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    // m => player.matrix, o => player.offset
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0 &&
          (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  createMatrix(w, h) {
    const matrix = [];

    while (h--) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  }

  draw() {
    const { ctx, arena, player } = this;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.drawMatrix(arena, { x: 0, y: 0 });
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
          ctx.fillStyle = 'green';
          ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }
}

const canvas = document.getElementById('canvas');
const tetris = new Tetris(canvas);

/*
  * [로직]
  > matrix 배열 만들기
  > matrix 캔버스에 그리기
  > matrix requestAnimationFrame 으로 아래로 이동 시키기 (시간 계산 공식이 이해가 안감...)
  > keydown 으로 방향 제어 기능 주기
  > 제한 구역 정하기
  > matrix 멈추기
  > collide (충돌. 어렵다...)
  > 회전
  > 회전 시 옆면 방지
  * [생각나는 필요 옵션]
  > matrix 7개,
  > 마지막 단계(last), 최소 속도(min), 최대 속도(max)
  > 점수, 블럭 미리보기, 레벨
  > 한줄 채워지면 한줄 지우기
*/
