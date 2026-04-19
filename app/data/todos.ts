// Category is now a plain string — managed dynamically in the store
export type Category = string;

export type Status = "not_started" | "in_progress" | "blocked" | "done";
export type TabId = "galaxy" | "list" | "logs";

export interface CategoryDef {
  name: string;
  color: string;
}

export interface SubTask {
  id: string;
  text: string;
  done: boolean;
}

export interface LogEntry {
  id: string;
  text: string;
  date: string;
  ts: number;
  images: string[];
  todoId?: number;
}

export interface TodoRecord {
  id: number;
  title: string;
  cat: Category;
  progress: number;
  status: Status;
  subTasks?: SubTask[];
}

export interface MonthlyFocus {
  month: string;   // "YYYY-MM"
  themeCat: string;
  goalIds: number[];
}

export interface SeedTodo {
  id: number;
  title: string;
  cat: Category;
  initProgress: number;
  initNote?: string;
}

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { name: "个人成长", color: "#c084fc" },
  { name: "爱好娱乐", color: "#fb923c" },
  { name: "赚钱",    color: "#4ade80" },
  { name: "AI",      color: "#22d3ee" },
  { name: "联盟",    color: "#a3e635" },
  { name: "内容",    color: "#f59e0b" },
  { name: "旅行",    color: "#34d399" },
  { name: "小毅",    color: "#f87171" },
  { name: "健康",    color: "#38bdf8" },
  { name: "Meto",    color: "#fbbf24" },
  { name: "社交",    color: "#818cf8" },
  { name: "未分类",  color: "#4a4a6a" },
];

// Per-todo migration map: old "成长" items get their correct new category
export const TODO_CAT_MIGRATION: Record<number, string> = {
  1: "爱好娱乐", 2: "爱好娱乐", 3: "个人成长", 4: "赚钱",
  6: "个人成长", 17: "爱好娱乐", 20: "赚钱", 28: "赚钱",
  29: "赚钱", 53: "个人成长", 60: "爱好娱乐", 61: "个人成长",
  62: "爱好娱乐", 65: "个人成长",
};

export const TODOS: SeedTodo[] = [
  { id: 1,  title: "玩5个剧情向游戏", cat: "爱好娱乐", initProgress: 0.6, initNote: "逆转裁判/lacuna/苏丹的游戏 3/5" },
  { id: 2,  title: "找到喜欢的电影导演", cat: "爱好娱乐", initProgress: 0 },
  { id: 3,  title: "跟着The Artist's Way做完一遍全书的创造力练习", cat: "个人成长", initProgress: 0.25, initNote: "Week3/12" },
  { id: 4,  title: "尝试5种不同的职业/兼职", cat: "赚钱", initProgress: 0.2, initNote: "1/5，活动策划落地" },
  { id: 5,  title: "认识一个日本籍好友", cat: "社交", initProgress: 1 },
  { id: 6,  title: "日语N1", cat: "个人成长", initProgress: 0 },
  { id: 7,  title: "自媒体形成体系，规律更新", cat: "内容", initProgress: 0.5, initNote: "当前目标每天3篇" },
  { id: 8,  title: "个人自媒体尝试3种新内容发布方式", cat: "内容", initProgress: 0 },
  { id: 9,  title: "认识三个可深度交流N方向问题的新朋友", cat: "社交", initProgress: 0.8, initNote: "大然、Reiky、开开、+1、Tab" },
  { id: 10, title: "人生无限联盟在线下建立社区空间", cat: "联盟", initProgress: 0, initNote: "在徐汇找地方" },
  { id: 11, title: "人生无限联盟举办5次线下传播/分享活动", cat: "联盟", initProgress: 0.2, initNote: "1/5" },
  { id: 12, title: "深入系统地学习商业运转，读5本书，出5篇笔记，转化为一次活动", cat: "联盟", initProgress: 0 },
  { id: 13, title: "深入学习运营，读5本书，出5篇笔记，转化为一次活动", cat: "联盟", initProgress: 0 },
  { id: 14, title: "同一时期每周有一个副本开展活动和共学", cat: "联盟", initProgress: 0 },
  { id: 15, title: "用Vibe Coding上线一个满足用户需求的产品", cat: "AI", initProgress: 0.3 },
  { id: 16, title: "参加3场黑客松的筹办", cat: "AI", initProgress: 0.67, initNote: "进化酒馆/南客松 2/3" },
  { id: 17, title: "创作小说（关于我和对象）", cat: "爱好娱乐", initProgress: 0 },
  { id: 18, title: "50%工作用AI来获得收益", cat: "AI", initProgress: 0.3 },
  { id: 19, title: "人生无限联盟会员付费入会超过50人", cat: "联盟", initProgress: 0.02, initNote: "1/50" },
  { id: 20, title: "给他人进行付费咨询，时薪200以上", cat: "赚钱", initProgress: 0 },
  { id: 21, title: "参加10+场AI活动", cat: "AI", initProgress: 0.7, initNote: "7/10，超脑AI冬令营，Linkloud，let's vision等" },
  { id: 22, title: "开创线下创造力工坊", cat: "联盟", initProgress: 0 },
  { id: 23, title: "为联盟成员用定制可复制的方式制作虚拟形象", cat: "AI", initProgress: 0 },
  { id: 24, title: "更新至少12期个人播客《你好，破壁！》", cat: "内容", initProgress: 0 },
  { id: 25, title: "帮洁云实现1个愿望", cat: "社交", initProgress: 0 },
  { id: 26, title: "深度与10+创造者链接", cat: "社交", initProgress: 0.3, initNote: "Reiky，泛函，开开" },
  { id: 27, title: "制作AI短片《3×8=24》", cat: "AI", initProgress: 0 },
  { id: 28, title: "尝试小红书虚拟产品并且卖出超过100单", cat: "赚钱", initProgress: 0 },
  { id: 29, title: "学习一人公司、自由职业领域知识，发5篇内容", cat: "赚钱", initProgress: 0 },
  { id: 30, title: "在国际渠道如X上保持更新", cat: "内容", initProgress: 0 },
  { id: 31, title: "更新12篇人生无限联盟公众号", cat: "联盟", initProgress: 0 },
  { id: 32, title: "为Bonjour!拉到一个合作", cat: "社交", initProgress: 1 },
  { id: 33, title: "用某种方式与Spark Lab达成合作", cat: "社交", initProgress: 0 },
  { id: 34, title: "去成都找Reiky玩", cat: "旅行", initProgress: 0 },
  { id: 35, title: "去杭州参加Builder大会", cat: "旅行", initProgress: 1 },
  { id: 36, title: "年末去泰国找Au lala一次，学美味炒饭的做法", cat: "旅行", initProgress: 0 },
  { id: 37, title: "去波多黎各参加Gia的婚礼", cat: "旅行", initProgress: 0, initNote: "12月" },
  { id: 38, title: "去深圳见福音、Joanna、奶黄包", cat: "旅行", initProgress: 0 },
  { id: 39, title: "和活云一起出去旅游一次", cat: "旅行", initProgress: 0 },
  { id: 40, title: "和小毅一起看5部他的碟片", cat: "小毅", initProgress: 0.2, initNote: "《Paris, Texas》1/5" },
  { id: 41, title: "坚持每周健身/运动至少1次", cat: "健康", initProgress: 0.3 },
  { id: 42, title: "游泳至少15次", cat: "健康", initProgress: 0 },
  { id: 43, title: "尝试一种新的舞种", cat: "健康", initProgress: 0 },
  { id: 44, title: "瘦到110斤，体脂率下降6%", cat: "健康", initProgress: 0.8, initNote: "目前55.2kg，基本达成" },
  { id: 45, title: "和小毅一起玩5款他推荐的游戏", cat: "小毅", initProgress: 0.4, initNote: "Journey/Webbed/雨世界✅/苏丹✅" },
  { id: 46, title: "跟小毅学习弹吉他并能自己弹一首", cat: "小毅", initProgress: 0 },
  { id: 47, title: "和小毅一起录制一首歌", cat: "小毅", initProgress: 0 },
  { id: 48, title: "和小毅一起去彼此的母校", cat: "小毅", initProgress: 0 },
  { id: 49, title: "给小毅尝试3种不同的穿衣风格", cat: "小毅", initProgress: 0 },
  { id: 50, title: "和小毅去他从小喜欢的地方看一圈", cat: "小毅", initProgress: 0, initNote: "林记牛肉面" },
  { id: 51, title: "用一种方式记录我与小毅的重要时刻和感受", cat: "小毅", initProgress: 0.1 },
  { id: 52, title: "给小毅定制一件首饰", cat: "小毅", initProgress: 0 },
  { id: 53, title: "Morning Pages 300篇", cat: "个人成长", initProgress: 0 },
  { id: 54, title: "和小毅一起看完5个想共同看清楚的书影音", cat: "小毅", initProgress: 0.6, initNote: "以爱✅/if恋✅/经典杯子蛋糕✅/潜伏" },
  { id: 55, title: "为Meto小猫咪建立成长档案", cat: "Meto", initProgress: 0 },
  { id: 56, title: "年终为Meto剪一部成长记录片", cat: "Meto", initProgress: 0 },
  { id: 57, title: "举办线上线下虚实结合的趣味活动（地图+线下奇怪小任务）", cat: "联盟", initProgress: 0 },
  { id: 58, title: "每月一个下午不碰手机，带Meto去户外或深度互动", cat: "Meto", initProgress: 0 },
  { id: 59, title: "和小毅构建5年后的理想生活状态，推到现在需要做什么", cat: "小毅", initProgress: 0 },
  { id: 60, title: "无目的的流浪：抓阄决定行进方向，交出旅行的控制权", cat: "爱好娱乐", initProgress: 0 },
  { id: 61, title: "给10个人做破壁长谈", cat: "个人成长", initProgress: 0 },
  { id: 62, title: "记录各种地方的环境声音，剪辑成2026声音纪念册", cat: "爱好娱乐", initProgress: 0 },
  { id: 63, title: "设计一个包含我、小毅和Meto的logo/专属纪念品/作品", cat: "小毅", initProgress: 0 },
  { id: 64, title: "每个月一次深度交流，讨论个人成长的痛点和相处细节", cat: "小毅", initProgress: 0 },
  { id: 65, title: "写完到24岁的人生故事", cat: "个人成长", initProgress: 0 },
];
