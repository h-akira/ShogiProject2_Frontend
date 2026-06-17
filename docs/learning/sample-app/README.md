# sample-app（学習用スニペット）

この `sample-app/` は、教材各章の演習で詰まったときに参照する**完成形スニペット置き場**です。
完全に動くアプリ一式ではなく、各章で手を動かして作る**最小コードの参考**を抜粋して置いています。

演習は基本的に、第 00 章で `npm create vue` から生成した `/tmp/learning-vue` の上で行います。
ここのファイルは、そのプロジェクトに**コピーして使える形**にしてあります。

## 収録物

| ファイル | 対応する章 | 内容 |
|----------|-----------|------|
| [src/composables/useCounter.ts](src/composables/useCounter.ts) | 01 / 06 | module スコープ ref で状態共有する Composable |
| [src/composables/useAuth.ts](src/composables/useAuth.ts) | 05 | ルートガード用の最小 auth Composable |

> 実プロジェクトの「本物」の実装は `shogi-main/src/` 配下にあります。学習用の最小版とは規模が違いますが、考え方（パターン）は同じです。各章末の「ShogiProject ではどうしているか」を参照してください。
