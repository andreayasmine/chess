document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("chessboard");
    const turnIndicator = document.getElementById("turn-indicator");

    let selectedPiece = null;
    let selectedSquare = null;
    let turn = "white"; // White moves first
    let isGameOver = false;

    const initialBoard = [
        ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
        ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
        ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
    ];

    function createBoard() {
        console.log("Creating the board...");
        board.innerHTML = "";
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement("div");
                square.classList.add("square", (row + col) % 2 === 0 ? "light" : "dark");
                square.dataset.row = row;
                square.dataset.col = col;

                if (initialBoard[row][col]) {
                    const piece = document.createElement("div");
                    piece.innerText = initialBoard[row][col];
                    piece.classList.add("piece");
                    square.appendChild(piece);
                }

                square.addEventListener("click", () => handleSquareClick(square));
                board.appendChild(square);
            }
        }
    }

    function handleSquareClick(square) {
        if (isGameOver) return;

        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = square.firstChild;

        if (selectedPiece) {
            if (square === selectedSquare) {
                deselect();
                return;
            }

            if (isValidMove(selectedPiece.innerText, selectedSquare, square)) {
                movePiece(selectedPiece, selectedSquare, square);

                if (isKingInCheck(turn)) {
                    alert("Invalid move! King is in check.");
                    undoMove();
                    return;
                }

                if (isKingCaptured()) {
                    alert(`Game Over! ${turn === "white" ? "Black" : "White"} Wins!`);
                    isGameOver = true;
                    return;
                }

                switchTurn();
            } else {
                alert("Invalid move!");
            }
            deselect();
        } else if (piece && isCurrentPlayerPiece(piece.innerText)) {
            selectPiece(square);
        }
    }

    function selectPiece(square) {
        deselect();
        selectedPiece = square.firstChild;
        selectedSquare = square;
        square.classList.add("selected");
    }

    function deselect() {
        if (selectedSquare) {
            selectedSquare.classList.remove("selected");
        }
        selectedPiece = null;
        selectedSquare = null;
    }

    function movePiece(piece, fromSquare, toSquare) {
        toSquare.innerHTML = "";
        toSquare.appendChild(piece);
    }

    function switchTurn() {
        turn = turn === "white" ? "black" : "white";
        turnIndicator.innerText = `Turn: ${turn.charAt(0).toUpperCase() + turn.slice(1)}`;
    }

    function isValidMove(piece, from, to) {
        const fromRow = parseInt(from.dataset.row);
        const fromCol = parseInt(from.dataset.col);
        const toRow = parseInt(to.dataset.row);
        const toCol = parseInt(to.dataset.col);
        const targetPiece = to.firstChild ? to.firstChild.innerText : null;

        if (targetPiece && isCurrentPlayerPiece(targetPiece)) return false;

        switch (piece) {
            case "♙": case "♟":
                return isValidPawnMove(fromRow, fromCol, toRow, toCol, targetPiece, piece === "♙");
            case "♖": case "♜":
                return isValidRookMove(fromRow, fromCol, toRow, toCol);
            case "♘": case "♞":
                return isValidKnightMove(fromRow, fromCol, toRow, toCol);
            case "♗": case "♝":
                return isValidBishopMove(fromRow, fromCol, toRow, toCol);
            case "♕": case "♛":
                return isValidRookMove(fromRow, fromCol, toRow, toCol) || isValidBishopMove(fromRow, fromCol, toRow, toCol);
            case "♔": case "♚":
                return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;
            default:
                return false;
        }
    }

    function isValidPawnMove(fromRow, fromCol, toRow, toCol, target, isWhite) {
        const direction = isWhite ? -1 : 1;
        return (fromCol === toCol && !target && toRow === fromRow + direction) || 
               (Math.abs(fromCol - toCol) === 1 && target && toRow === fromRow + direction);
    }

    function isValidRookMove(fromRow, fromCol, toRow, toCol) {
        return fromRow === toRow || fromCol === toCol;
    }

    function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        return (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) ||
               (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2);
    }

    function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
        return Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol);
    }

    function isKingCaptured() {
        if (!findKing("white")) {
            alert("Game Over! Black Wins!"); // White's king is missing, so Black wins.
            isGameOver = true;
            return true;
        }
        if (!findKing("black")) {
            alert("Game Over! White Wins!"); // Black's king is missing, so White wins.
            isGameOver = true;
            return true;
        }
        return false;
    }
    

    function findKing(color) {
        const kingSymbol = color === "white" ? "♔" : "♚";
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = getSquare(row, col);
                if (square.firstChild && square.firstChild.innerText === kingSymbol) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    function isKingInCheck(color) {
        const kingPos = findKing(color);
        return isSquareAttacked(kingPos.row, kingPos.col, color);
    }

    function isSquareAttacked(row, col, color) {
        const opponentColor = color === "white" ? "black" : "white";

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const square = getSquare(r, c);
                if (square.firstChild && isOpponentPiece(square.firstChild.innerText, opponentColor)) {
                    if (isValidMove(square.firstChild.innerText, square, getSquare(row, col))) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function getSquare(row, col) {
        return document.querySelector(`.square[data-row='${row}'][data-col='${col}']`);
    }

    function isCurrentPlayerPiece(piece) {
        return (turn === "white" && "♙♖♘♗♕♔".includes(piece)) ||
               (turn === "black" && "♟♜♞♝♛♚".includes(piece));
    }

    function isOpponentPiece(piece, opponentColor) {
        return (opponentColor === "white" && "♙♖♘♗♕♔".includes(piece)) ||
               (opponentColor === "black" && "♟♜♞♝♛♚".includes(piece));
    }

    createBoard();
});
