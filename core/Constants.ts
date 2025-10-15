const FAKE_DATA = {
  IMAGE_URL:
    'https://cungdecor.vn/wp-content/uploads/2019/04/kien-truc-noi-that-la-gi-xu-huong-thiet-ke-kien-truc-noi-that-hien-nay-02.jpg',
};
const IMAGE_URL = "https://survifyposts.s3.ap-southeast-1.amazonaws.com/";

export const SOCKET_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:6001' : 'https://app.survify.net';

export const API_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:6001' : 'https://app.survify.net';

export const AFFILIATE_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:6002' : 'https://app.survify.net';

export const POSTHOG_KEY = process.env.NODE_ENV !== 'production' ? 'phc_2CSfwxsr7KuXj0jJ4YvMmsCzV2MWRaUaTEp14WfY9CD' : 'phc_2CSfwxsr7KuXj0jJ4YvMmsCzV2MWRaUaTEp14WfY9CD';
export const POSTHOG_HOST = process.env.NODE_ENV !== 'production' ? 'https://us.i.posthog.com' : 'https://us.i.posthog.com';

export const FIREBASE_CONFIG =
  process.env.NODE_ENV !== 'production'
    ? {
      apiKey: 'AIzaSyCZMt4QsJtfaWQtGlaa6sNY1dmBZGZUFtA',
      authDomain: 'wele-test.firebaseapp.com',
      projectId: 'wele-test',
      storageBucket: 'wele-test.appspot.com',
      messagingSenderId: '436382744824',
      appId: '1:436382744824:web:d1820293ad45c868fbfb0d',
      measurementId: 'G-GDR240L6VS',
    }
    : {
      apiKey: 'AIzaSyA4qy9h2VN5IhpsukW9bqwGDdq4Q0GjcP4',
      authDomain: 'wele-data.firebaseapp.com',
      projectId: 'wele-data',
      storageBucket: 'wele-data.appspot.com',
      messagingSenderId: '841968592154',
      appId: '1:841968592154:web:9412fd3726ace7faa238a3',
      measurementId: 'G-VMGG5CX1ZK',
    };

export const ROLES = {
  Member: 0,
  Admin: 1,
  ContentCreator: 2,
  Teacher: 3,
};

const Constants = {
  FAKE_DATA,
  IMAGE_URL,
  ROLES
};




export enum QUESTION_TYPE {
  SHORT_ANSWER = 0,
  PARAGRAPH = 1,
  MULTIPLE_CHOICE = 2,
  DROPDOWN = 3,
  CHECKBOX = 4,
  LINEAR_SCALE = 5,
  TITLE_BLOCK = 6,
  MULTIPLE_CHOICE_GRID = 7,
  CHECKBOX_GRID = 7,
  SECTION_BLOCK = 8,
  DATE = 9,
  TIME = 10,
  IMAGE_BLOCK = 11,
  VIDEO_BLOCK = 12,
  FILE = 13,
  RATING = 18,
}




export const ORDER_STATUS = {
  RUNNING: 'Running',
  PAUSE: 'Pause',
  FAILED: 'Failed',
  CANCELED: 'Canceled',
  SUCCESS: 'Success',
  ERROR: 'ERROR',
};

export const LAYOUT_TYPES = {
  Admin: 'admin',
  Profile: 'profile',
  Home: 'home',
  WeleClass: 'weleclass',
};

export const MediaQuery = {
  is2Xl: `(min-width: 1536px)`,
  isXl: `(min-width: 1280px)`,
  isSemiLg: `(min-width: 1200px)`,
  isLg: `(min-width: 1024px)`,
  isSemiMd: `(min-width: 960px)`,
  isMd: `(min-width: 768px)`,
  isSm: `(min-width: 640px)`,
  isSemiXs: `(min-width: 540px)`,
  isXs: `(min-width: 468px)`,
};

export const Code = {
  Error: -1,
  SUCCESS: 1,
  INVALID_PASSWORD: 2,
  INACTIVATE_AUTH: 3,
  NOTFOUND: 4,
  INVALID_AUTH: 5,
  INVALID_INPUT: 6,
};


export default Constants;



export const OPTIONS_DATA = [
  "other (ignore - no need to fill)",
  "name",
  "email",
  "phone",
  "custom (custom data)"
];

export const OPTIONS_DELAY_ENUM = {
  NO_DELAY: 0,
  SHORT_DELAY: 1,
  STANDARD_DELAY: 2,
  LONG_DELAY: 3,
  SPECIFIC_DELAY: 4
}

export const OPTIONS_DELAY = {
  [OPTIONS_DELAY_ENUM.NO_DELAY]: {
    name: "No delay",
    price: 350,
    description: "Send without delay"
  },
  [OPTIONS_DELAY_ENUM.SHORT_DELAY]: {
    name: "Short delay",
    price: 400,
    description: "Send with 1-5 minutes delay between each request"
  },
  [OPTIONS_DELAY_ENUM.STANDARD_DELAY]: {
    name: "Standard delay",
    price: 450,
    description: "Send with 1-10 minutes delay between each request"
  },
  [OPTIONS_DELAY_ENUM.LONG_DELAY]: {
    name: "Long delay",
    price: 500,
    description: "Send with 1-20 minutes delay between each request"
  },
  [OPTIONS_DELAY_ENUM.SPECIFIC_DELAY]: {
    name: "Specific delay",
    price: 600,
    description: "Send with specific delay between each request"
  }

}


export const BANK_INFO = {
  current: 'OCB',
  providers: {
    OCB: {
      name: "OCB - Ngân hàng Phương Đông",
      number: "SEPFFR148620"
    },
    VTB: {
      name: "VTB - Viettin Bank",
      number: "107868958175"
    }
  }
}


export const ORDER_TYPE = {
  AUTOFILL: 'Auto fill',
  PREFILL: 'Pre fill data',
  AGENT: 'Agent',
  DATA_MODEL: 'Data model'
}



export const REFER_PERCENT = 15;
export const MIN_DRAW_CREDIT = 100;
export const AI_PRICE = 1650;

export const MODEL_PRICE = 250;

export const MODERATE_VARIABLE_PRICE = 80;
export const MEDIATOR_VARIABLE_PRICE = 80;
export const DEPENDENT_VARIABLE_PRICE = 20;
export const INDEPENDENT_VARIABLE_PRICE = 30;

export const READ_RESULT_PRICE = 50;

export const PULSES_TOKEN = 'My5wdWxzZXN1cnZleXM';


export const PRICING_PACKAGES = [
  {
    id: 'starter_package',
    name: 'Starter package',
    price: 9,
    old_price: 15,
    credit: 300,
    paddle_product_id: 'pro_01k7bxw7kdjbv6tpx4n4kn0as0',
    paddle_price_id: 'pri_01k7by8zxbe9exh7zdssjxtpdf'
  },
  {
    id: 'standard_package',
    name: 'Standard package',
    price: 19,
    old_price: 35,
    credit: 700,
    paddle_product_id: 'pro_01k7bqq13zhsrwxv5hdyxm3ndc',
    paddle_price_id: 'pri_01k7bqr7pacsjwqt70y0cvy9tr'
  },
  {
    id: 'expert_package',
    name: 'Expert package',
    price: 49,
    old_price: 100,
    credit: 2000,
    paddle_product_id: 'pro_01k7bqq13zhsrwxv5hdyxm3ndc',
    paddle_price_id: 'pri_01k7bqr7pacsjwqt70y0cvy9tr'
  }
]

export const PADDLE_CLIENT_TOKEN = 'test_e38a19aec12f9a5b712c65b3901';


export const AI_CASES = [
  {
    id: 'phan_tich_quyet_dinh_nhan_viec',
    numRequest: 400,
    demographicGoal: `
    - Gender? Nearly 60% female
    - Age?
      18-22 years old: 55.6%
      23-25 years old: 35,7%
      26-28 years old: 8,7%
    - Education level?
      Đại học: gần 80%, còn lại chia ra
    - Current status?
      Student: 29.3%
      Recent graduate: 40.1%
      Working less than 2 years: 20.2%
      Working for more than 2 years: 10.4%
    - Number of companies you have applied to?
      1 - 2 companies: 40%
      3 - 5 companies: 35%
      More than 5 companies: 25%
    - When was the nearest company you applied to?
      Within the last 12 months: 60%
      From 1 to less than 3 years ago: 35%
      More than 3 years ago: 5%
`,
    spssGoal: `
      Likert scale from 1-5
      Use regression analysis, do not use SEM
      Hypothesis H1: Recruitment information has a positive impact on the decision to accept a job by Gen Z in Ho Chi Minh City. ⇒ ACCEPT
      Hypothesis H2: Recruitment technology has a positive impact on the decision to accept a job by Gen Z in Ho Chi Minh City. ⇒ MAYBE
      Hypothesis H3: Interaction with the employer has a positive impact on the decision to accept a job by Gen Z in Ho Chi Minh City. ⇒ ACCEPT
      Hypothesis H4: The attitude of the employer has a positive impact on the decision to accept a job by Gen Z in Ho Chi Minh City. ⇒ ACCEPT
      Hypothesis H5: Awareness of fairness in recruitment has a positive impact on the decision to accept a job by Gen Z in Ho Chi Minh City. ⇒ ACCEPT
      Hypothesis H6: The speed of the recruitment process has a positive impact on the decision to accept a job by Gen Z in Ho Chi Minh City. ⇒ ACCEPT
    `,
    image: 'phan_tich_quyet_dinh_nhan_viec.png',
    result_report_url: 'phan_tich_quyet_dinh_nhan_viec.pdf',
    result_data_url: 'phan_tich_quyet_dinh_nhan_viec.csv'

  },
  {
    id: 'phan_tich_quyet_dinh_mua_hang_genz',
    numRequest: 203,
    demographicGoal: `Ngẫu nhiên sao cho hướng đến GenZ, sinh viên trên địa bàn Đà Nẵng, hầu hết sử dụng tiktok shop để mua hàng với nhiều lí do khác nhau.`,
    spssGoal: `
    Mô hình hồi quy, 5 biến độc lập, 1 biến phụ thuộc, thang đo likert 5
    phân tích và đánh giá cách TikTok Shop ảnh hưởng đến hành vi và mô hình tiêu dùng của thế hệ Gen Z tại Đà Nẵng, từ đó đề xuất giải pháp cho doanh nghiệp trong việc tiếp cận nhóm khách hàng này hiệu quả hơn. 
    Chấp nhận tất cả các giả thuyết sau
    The spread of content has a positive impact on the decision to buy on Tiktok Shop
    Social/psychological influence has a positive impact on the decision to buy on Tiktok Shop
    Trending consumption has a positive impact on the decision to buy on Tiktok Shop
    Convenience of shopping has a positive impact on the decision to buy on Tiktok Shop
    Attractive sound and images have a positive impact on the decision to buy on Tiktok Shop
    `,
    image: 'phan_tich_quyet_dinh_mua_hang_genz.png',
    result_report_url: 'phan_tich_quyet_dinh_mua_hang_genz.pdf',
    result_data_url: 'phan_tich_quyet_dinh_mua_hang_genz.csv'

  },
  {
    id: 'phan_tich_su_hai_long_kh',
    numRequest: 173,
    demographicGoal: `Randomly distributed`,
    spssGoal: `
    Hypothesis TC (Accessibility), NC (Speed), AT (Safety), TN (Convenience, comfort), CX (Accuracy), and have a positive correlation with customer satisfaction.
    Accept/ reject any hypothesis: randomly 
    Remove any observation variables: randomly
    The quality of service on bus number 10 is built based on 5 factors affecting customer satisfaction, which are determined by 25 observation variables.
    The component of Accessibility includes 6 observation variables encoded as: TC1 – TC6
    The component of Speed includes 4 observation variables encoded as: NC1 – NC4
    The component of Safety includes 4 observation variables encoded as: AT1 – AT4
    The component of Accuracy includes 3 observation variables encoded as: CX1 – CX3
    The component of Convenience, comfort includes 5 observation variables encoded as: TN1 – TN5
    The component of Customer satisfaction includes 3 observation variables encoded as: SHL1 – SHL3

    `,
    image: 'phan_tich_su_hai_long_kh.png',
    result_report_url: 'phan_tich_su_hai_long_kh.pdf',
    result_data_url: 'phan_tich_su_hai_long_kh.csv'

  },

];
