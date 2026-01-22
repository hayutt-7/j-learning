// JLPT Vocabulary Database
// This file contains real JLPT vocabulary for each level

import { LearningItem } from './types';

export const VOCAB_DATABASE: Record<string, LearningItem[]> = {
    'N5': [
        // Basic Nouns
        { id: 'n5_1', text: '猫', reading: 'ねこ', meaning: '고양이', type: 'vocab', jlpt: 'N5', explanation: '', example: '猫が好きです。(고양이를 좋아해요.)' },
        { id: 'n5_2', text: '犬', reading: 'いぬ', meaning: '개', type: 'vocab', jlpt: 'N5', explanation: '', example: '犬を飼っています。(개를 키우고 있어요.)' },
        { id: 'n5_3', text: '学生', reading: 'がくせい', meaning: '학생', type: 'vocab', jlpt: 'N5', explanation: '', example: '私は学生です。(저는 학생입니다.)' },
        { id: 'n5_4', text: '先生', reading: 'せんせい', meaning: '선생님', type: 'vocab', jlpt: 'N5', explanation: '', example: '先生、質問があります。(선생님, 질문이 있습니다.)' },
        { id: 'n5_5', text: '友達', reading: 'ともだち', meaning: '친구', type: 'vocab', jlpt: 'N5', explanation: '', example: '友達と遊びます。(친구와 놀아요.)' },
        { id: 'n5_6', text: '家族', reading: 'かぞく', meaning: '가족', type: 'vocab', jlpt: 'N5', explanation: '', example: '家族は四人です。(가족은 4명입니다.)' },
        { id: 'n5_7', text: '水', reading: 'みず', meaning: '물', type: 'vocab', jlpt: 'N5', explanation: '', example: '水をください。(물 주세요.)' },
        { id: 'n5_8', text: '本', reading: 'ほん', meaning: '책', type: 'vocab', jlpt: 'N5', explanation: '', example: '本を読みます。(책을 읽어요.)' },
        // Basic Verbs
        { id: 'n5_9', text: '食べる', reading: 'たべる', meaning: '먹다', type: 'vocab', jlpt: 'N5', explanation: '1류(이치단) 동사', example: 'ご飯を食べる。(밥을 먹다.)' },
        { id: 'n5_10', text: '飲む', reading: 'のむ', meaning: '마시다', type: 'vocab', jlpt: 'N5', explanation: '5류(고단) 동사', example: 'お茶を飲む。(차를 마시다.)' },
        { id: 'n5_11', text: '行く', reading: 'いく', meaning: '가다', type: 'vocab', jlpt: 'N5', explanation: '5류 동사, 불규칙 활용', example: '学校に行く。(학교에 가다.)' },
        { id: 'n5_12', text: '来る', reading: 'くる', meaning: '오다', type: 'vocab', jlpt: 'N5', explanation: '카변(カ変) 동사', example: '友達が来る。(친구가 온다.)' },
        { id: 'n5_13', text: '見る', reading: 'みる', meaning: '보다', type: 'vocab', jlpt: 'N5', explanation: '1류 동사', example: '映画を見る。(영화를 보다.)' },
        { id: 'n5_14', text: '聞く', reading: 'きく', meaning: '듣다', type: 'vocab', jlpt: 'N5', explanation: '5류 동사', example: '音楽を聞く。(음악을 듣다.)' },
        { id: 'n5_15', text: '書く', reading: 'かく', meaning: '쓰다', type: 'vocab', jlpt: 'N5', explanation: '5류 동사', example: '手紙を書く。(편지를 쓰다.)' },
        // Basic Adjectives
        { id: 'n5_16', text: '大きい', reading: 'おおきい', meaning: '크다', type: 'vocab', jlpt: 'N5', explanation: 'い형용사', example: '大きい家。(큰 집.)' },
        { id: 'n5_17', text: '小さい', reading: 'ちいさい', meaning: '작다', type: 'vocab', jlpt: 'N5', explanation: 'い형용사', example: '小さい猫。(작은 고양이.)' },
        { id: 'n5_18', text: '新しい', reading: 'あたらしい', meaning: '새롭다', type: 'vocab', jlpt: 'N5', explanation: 'い형용사', example: '新しい本。(새 책.)' },
        { id: 'n5_19', text: '古い', reading: 'ふるい', meaning: '오래되다, 낡다', type: 'vocab', jlpt: 'N5', explanation: 'い형용사', example: '古い建物。(오래된 건물.)' },
        { id: 'n5_20', text: '高い', reading: 'たかい', meaning: '높다, 비싸다', type: 'vocab', jlpt: 'N5', explanation: 'い형용사', example: '高いビル。(높은 빌딩.)' },
    ],
    'N4': [
        { id: 'n4_1', text: '会議', reading: 'かいぎ', meaning: '회의', type: 'vocab', jlpt: 'N4', explanation: '', example: '会議に出席する。(회의에 출석하다.)' },
        { id: 'n4_2', text: '届ける', reading: 'とどける', meaning: '전달하다, 배달하다', type: 'vocab', jlpt: 'N4', explanation: '1류 동사', example: '荷物を届ける。(짐을 배달하다.)' },
        { id: 'n4_3', text: '経験', reading: 'けいけん', meaning: '경험', type: 'vocab', jlpt: 'N4', explanation: '', example: '経験が大切だ。(경험이 중요하다.)' },
        { id: 'n4_4', text: '準備', reading: 'じゅんび', meaning: '준비', type: 'vocab', jlpt: 'N4', explanation: '', example: '準備ができた。(준비가 됐다.)' },
        { id: 'n4_5', text: '紹介', reading: 'しょうかい', meaning: '소개', type: 'vocab', jlpt: 'N4', explanation: '', example: '友達を紹介する。(친구를 소개하다.)' },
        { id: 'n4_6', text: '説明', reading: 'せつめい', meaning: '설명', type: 'vocab', jlpt: 'N4', explanation: '', example: '説明してください。(설명해 주세요.)' },
        { id: 'n4_7', text: '予定', reading: 'よてい', meaning: '예정', type: 'vocab', jlpt: 'N4', explanation: '', example: '明日の予定。(내일 예정.)' },
        { id: 'n4_8', text: '決める', reading: 'きめる', meaning: '정하다, 결정하다', type: 'vocab', jlpt: 'N4', explanation: '1류 동사', example: '日程を決める。(일정을 정하다.)' },
        { id: 'n4_9', text: '変える', reading: 'かえる', meaning: '바꾸다', type: 'vocab', jlpt: 'N4', explanation: '1류 동사', example: '予定を変える。(예정을 바꾸다.)' },
        { id: 'n4_10', text: '比べる', reading: 'くらべる', meaning: '비교하다', type: 'vocab', jlpt: 'N4', explanation: '1류 동사', example: '二つを比べる。(둘을 비교하다.)' },
        { id: 'n4_11', text: '簡単', reading: 'かんたん', meaning: '간단하다', type: 'vocab', jlpt: 'N4', explanation: 'な형용사', example: '簡単な問題。(간단한 문제.)' },
        { id: 'n4_12', text: '複雑', reading: 'ふくざつ', meaning: '복잡하다', type: 'vocab', jlpt: 'N4', explanation: 'な형용사', example: '複雑な状況。(복잡한 상황.)' },
    ],
    'N3': [
        { id: 'n3_1', text: '優勝', reading: 'ゆうしょう', meaning: '우승', type: 'vocab', jlpt: 'N3', explanation: '', example: '優勝おめでとう！(우승 축하해!)' },
        { id: 'n3_2', text: '成功', reading: 'せいこう', meaning: '성공', type: 'vocab', jlpt: 'N3', explanation: '', example: '成功を祈る。(성공을 빈다.)' },
        { id: 'n3_3', text: '失敗', reading: 'しっぱい', meaning: '실패', type: 'vocab', jlpt: 'N3', explanation: '', example: '失敗を恐れない。(실패를 두려워하지 않다.)' },
        { id: 'n3_4', text: '努力', reading: 'どりょく', meaning: '노력', type: 'vocab', jlpt: 'N3', explanation: '', example: '努力が実る。(노력이 결실을 맺다.)' },
        { id: 'n3_5', text: '挑戦', reading: 'ちょうせん', meaning: '도전', type: 'vocab', jlpt: 'N3', explanation: '', example: '新しいことに挑戦する。(새로운 것에 도전하다.)' },
        { id: 'n3_6', text: '影響', reading: 'えいきょう', meaning: '영향', type: 'vocab', jlpt: 'N3', explanation: '', example: '影響を受ける。(영향을 받다.)' },
        { id: 'n3_7', text: '確認', reading: 'かくにん', meaning: '확인', type: 'vocab', jlpt: 'N3', explanation: '', example: '内容を確認する。(내용을 확인하다.)' },
        { id: 'n3_8', text: '適当', reading: 'てきとう', meaning: '적당하다, 대충', type: 'vocab', jlpt: 'N3', explanation: 'な형용사', example: '適当に選ぶ。(대충 고르다.)' },
        { id: 'n3_9', text: '普通', reading: 'ふつう', meaning: '보통', type: 'vocab', jlpt: 'N3', explanation: '', example: '普通の日。(평범한 날.)' },
        { id: 'n3_10', text: '受ける', reading: 'うける', meaning: '받다', type: 'vocab', jlpt: 'N3', explanation: '1류 동사', example: '試験を受ける。(시험을 보다.)' },
    ],
    'N2': [
        { id: 'n2_1', text: '際して', reading: 'さいして', meaning: '~에 즈음하여', type: 'vocab', jlpt: 'N2', explanation: '문어체 표현', example: '出発に際して。(출발에 즈음하여.)' },
        { id: 'n2_2', text: '一方', reading: 'いっぽう', meaning: '한편', type: 'vocab', jlpt: 'N2', explanation: '', example: '一方、彼は反対した。(한편, 그는 반대했다.)' },
        { id: 'n2_3', text: '傾向', reading: 'けいこう', meaning: '경향', type: 'vocab', jlpt: 'N2', explanation: '', example: '増加傾向にある。(증가 경향에 있다.)' },
        { id: 'n2_4', text: '現象', reading: 'げんしょう', meaning: '현상', type: 'vocab', jlpt: 'N2', explanation: '', example: '社会現象。(사회 현상.)' },
        { id: 'n2_5', text: '状態', reading: 'じょうたい', meaning: '상태', type: 'vocab', jlpt: 'N2', explanation: '', example: '健康状態。(건강 상태.)' },
        { id: 'n2_6', text: '判断', reading: 'はんだん', meaning: '판단', type: 'vocab', jlpt: 'N2', explanation: '', example: '判断を下す。(판단을 내리다.)' },
        { id: 'n2_7', text: '把握', reading: 'はあく', meaning: '파악', type: 'vocab', jlpt: 'N2', explanation: '', example: '状況を把握する。(상황을 파악하다.)' },
        { id: 'n2_8', text: '検討', reading: 'けんとう', meaning: '검토', type: 'vocab', jlpt: 'N2', explanation: '', example: '検討中です。(검토 중입니다.)' },
    ],
    'N1': [
        { id: 'n1_1', text: '疎通', reading: 'そつう', meaning: '소통', type: 'vocab', jlpt: 'N1', explanation: '', example: '意思疎通が大切だ。(의사소통이 중요하다.)' },
        { id: 'n1_2', text: '齟齬', reading: 'そご', meaning: '어긋남, 불일치', type: 'vocab', jlpt: 'N1', explanation: '', example: '意見に齟齬がある。(의견에 차이가 있다.)' },
        { id: 'n1_3', text: '顕著', reading: 'けんちょ', meaning: '현저하다', type: 'vocab', jlpt: 'N1', explanation: 'な형용사', example: '顕著な成長。(현저한 성장.)' },
        { id: 'n1_4', text: '脆弱', reading: 'ぜいじゃく', meaning: '취약하다', type: 'vocab', jlpt: 'N1', explanation: 'な형용사', example: '脆弱な体制。(취약한 체제.)' },
        { id: 'n1_5', text: '凌駕', reading: 'りょうが', meaning: '능가하다', type: 'vocab', jlpt: 'N1', explanation: '', example: '予想を凌駕する。(예상을 능가하다.)' },
        { id: 'n1_6', text: '逸脱', reading: 'いつだつ', meaning: '일탈', type: 'vocab', jlpt: 'N1', explanation: '', example: '規則から逸脱する。(규칙에서 벗어나다.)' },
    ],
};
