## 課題

ブロスタのガチバトルのレジェンド〜マスターあたりで発生する利敵や献上のせいでマッチに敗北してプロランクになることが困難になっている。
献上・利敵に８回も当たらなければ全シーズンはプロ行けてたはず、、、

<img width="2556" height="1179" alt="IMG_1364" src="https://github.com/user-attachments/assets/265e3ef7-dae0-45c2-9ccf-a693cbfc57ea" />



## 想定利用ユーザー

利敵や献上に悩まされている(イラついている)プレイヤー

## 解決策

- ガチバトルのピック画面で味方の名前を検索することで利敵や献上をしたことがあるかが分かる。利敵や献上をしたことがあるプレイヤーが味方に来た場合はマッチを切断する。
- ガチバトルで利敵や献上が来たら、このサイトにプレイ動画を送ってもらって、利敵や献上をしたプレイヤーを記録に残す

## 環境構築

- このレポジトリのをローカル環境にgit cloneする
```bash
git clone https://github.com/neco3coffee/exit_cheat_bs.git
```
- cloneしたexit_cheat_bsディレクトリに移動する
```bash
cd exit_cheat_bs
```

- exit_cheat_bs/.env.keysを作成して、DOTENV_PRIVATE_KEYをneco3coffeeにリクエストしてください。BitWarden経由で送ります！
```bash
touch .env.keys
```
https://dotenvx.com/docs/quickstart/encryption

- docker-compose.ymlの内容をもとにコンテナ群を起動する

```bash
dotenvx run -- docker compose up -d
```

- Next.js(web)が起動していることを確認する http://localhost:3001/
- Rails(app)が起動していることを確認する http://localhost:3000/
- rails db:migrateをコンテナ内で実施してデータベースにmigrationファイルの内容を反映する
```bash
docker compose exec app rails db:migrate
```

- 再度Rails(app) http://localhost:3000/ にアクセスしてエラーが消えていることを確認する

- railsのORMからMySQLにアクセスできているか確認する
```bash
docker compose exec -it app rails console
```
- rails consoleでデータを作成できるか確認
```ruby
app(dev)> Test.create(name: "test_name")
```
- rails consoleでデータを取得できるか確認
```ruby
app(dev)> Test.all
```

これでNext(web), Rails(app), MySQL(db)の動作確認ができました。

以上で環境構築終了になります。お疲れ様でした！


## 施策の流れ

以下のスプリントカンバンボードの流れに沿って
https://github.com/users/neco3coffee/projects/11


## 開発の流れ

コンテナ群を起動する
```
docker compose up
```

リモートブランチの最新の変更をローカルブランチに取り込む
```
git pull origin main
```
依存関係のあるパケージのインストール
```
cd frontend && nvm use && npm install
cd backend && bundle install
```
作業ブランチを作成する
```
git checkout -b feature/xxx
```
機能追加やバグの修正などを行う

作業内容をリモートレポジトリに反映する
```
git add .
git commit -m "xxxの機能を追加"
git push origin feature/xxx
```
githubサイトのfeature/xxxからmainブランチに向けてプルリクエストを作成する

コードレビューに対応したら、修正内容をリモートレポジトリに反映する
```
git add .
git commit - "xxxのaaaを修正"
git push origin feature/xxx
```

LGTMをもらったらgithubサイトでプルリクエストをmainにマージ(自動で本番環境に反映されます)

本番環境にリリースされたら動作確認を行う

動作に問題がなければスプリントカンバンボードの定量検証を随時実施してください


- コンテナに入って作業する時〜
```
docker compose exec web /bin/bash   # bash があるとき
docker compose exec web sh          # bash がないとき
```

- キャッシュ関連削除〜
```
Dockerビルドキャッシュ: docker compose build --no-cache
Docker全体キャッシュ: docker system prune -af
Nex.js: rm -rf .next
npmキャッシュ: npm cache clean --force
```

## おすすめ配信者　

- [ないぴしゅ、こんばんゎ〜](https://www.tiktok.com/@naipishu3000)
- [アイシー、ガチバトル王](https://www.youtube.com/channel/UCmZnnVj4QEBekl-jrxkjRog)
- [わほっち、ベリーつかい](https://www.youtube.com/@-Wahochi)
- [ジェネ、ジェネアバずれは偽物](https://www.youtube.com/@Jene_Azure)
- [やぴまる、ジェヨン](https://www.youtube.com/@YAPIMARU)


## 権利
© 2025 neco3coffee. All rights reserved.
This repository is provided for personal reference and learning purposes only.
Copying, redistribution, or commercial use is prohibited without explicit permission.
