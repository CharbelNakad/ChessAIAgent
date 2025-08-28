from typing import Dict, Optional
import chess

def grade_move(
    board_before: chess.Board,
    board_after: chess.Board,
    engine: "StockfishEngine",
) -> Dict[str, any]:
    """
    Grades a move by comparing the evaluation of the position before and after the move.
    Returns a dictionary containing the move's grade, centipawn difference, and other info.
    """
    # Get evaluation before the move
    eval_before = engine.evaluate_fen(board_before.fen())
    score_before_cp = eval_before.get("score_cp") or 0
    mate_before = eval_before.get("mate")

    # Get evaluation after the move
    eval_after = engine.evaluate_fen(board_after.fen())
    score_after_cp = eval_after.get("score_cp") or 0
    mate_after = eval_after.get("mate")

    # Handle mate scenarios
    if mate_before is not None:
        # If there was a mate before, any move not delivering it (or delaying it) is a blunder.
        if mate_after is None or (mate_after < 0 and mate_before > 0) or (mate_after > 0 and mate_before < 0):
             return {"grade": "Blunder", "diff_cp": -1000, "description": "Missed a forced mate."}
        return {"grade": "Best", "diff_cp": 0, "description": "Continues a forced mate sequence."}
    
    if mate_after is not None:
         # Moving into a forced mate is a blunder
         return {"grade": "Blunder", "diff_cp": -1000, "description": "Allows a forced mate."}

    # Calculate centipawn difference
    diff_cp = score_after_cp - score_before_cp

    # Grade based on centipawn difference
    if diff_cp >= 0:
        if diff_cp > 50:
            grade = "Brilliant"
            description = "A fantastic move that significantly improves the position."
        else:
            grade = "Best"
            description = "An excellent move."
    elif -50 <= diff_cp < 0:
        grade = "Good"
        description = "A solid move."
    elif -150 <= diff_cp < -50:
        grade = "Inaccuracy"
        description = "A minor error that worsens the position slightly."
    elif -300 <= diff_cp < -150:
        grade = "Mistake"
        description = "A significant error."
    else: # diff_cp < -300
        grade = "Blunder"
        description = "A very bad move that could lose the game."

    return {"grade": grade, "diff_cp": diff_cp, "description": description} 