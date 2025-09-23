# Created by GHCP
"""簡易四則演算スクリプト

Usage examples:
  python calc.py add 1 2        # 1 + 2 = 3
  python calc.py sub 5 3        # 5 - 3 = 2
  python calc.py mul 7 8        # 7 * 8 = 56
  python calc.py div 10 2       # 10 / 2 = 5
  python calc.py --precision 4 div 1 3   # 小数点桁指定

Exit codes:
  0 正常終了
  1 引数エラー
  2 演算エラー（ゼロ除算など）
"""
from __future__ import annotations
import argparse
from decimal import Decimal, getcontext, DivisionByZero, InvalidOperation
from typing import Callable, Dict

OperationFunc = Callable[[Decimal, Decimal], Decimal]


def add(a: Decimal, b: Decimal) -> Decimal:
    return a + b


def sub(a: Decimal, b: Decimal) -> Decimal:
    return a - b


def mul(a: Decimal, b: Decimal) -> Decimal:
    return a * b


def div(a: Decimal, b: Decimal) -> Decimal:
    if b == 0:
        raise DivisionByZero("division by zero")
    return a / b

OPERATIONS: Dict[str, OperationFunc] = {
    "add": add,
    "sub": sub,
    "mul": mul,
    "div": div,
}

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="四則演算を行います")
    parser.add_argument("operation", choices=OPERATIONS.keys(), help="演算種別")
    parser.add_argument("a", help="左オペランド (数値)")
    parser.add_argument("b", help="右オペランド (数値)")
    parser.add_argument("--precision", type=int, default=10, help="計算精度(有効桁数)")
    return parser


def parse_decimal(value: str) -> Decimal:
    try:
        return Decimal(value)
    except InvalidOperation:
        raise argparse.ArgumentTypeError(f"数値ではありません: {value}")


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    getcontext().prec = max(1, args.precision)

    try:
        a = parse_decimal(args.a)
        b = parse_decimal(args.b)
    except argparse.ArgumentTypeError as e:
        print(f"引数エラー: {e}")
        return 1

    op_func = OPERATIONS[args.operation]
    try:
        result = op_func(a, b)
    except DivisionByZero:
        print("エラー: ゼロによる除算はできません")
        return 2
    except Exception as e:  # 予期せぬエラー
        print(f"演算エラー: {e}")
        return 2

    # 末尾の不要な 0 を整形
    result_str = format(result.normalize(), 'f').rstrip('0').rstrip('.') if result == result.normalize() else str(result)
    print(result_str)
    return 0

if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
