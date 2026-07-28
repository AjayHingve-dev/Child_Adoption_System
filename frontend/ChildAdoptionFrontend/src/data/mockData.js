export const children=[
 {childId:1,firstName:'Aarav',lastName:'Kumar',gender:'MALE',age:6,dob:'2020-03-12',bloodGroup:'B+',education:'Grade 1',hobbies:'Drawing, football',medicalNotes:'Healthy; seasonal allergies',specialNeeds:false,description:'Cheerful, curious and enjoys group activities.',status:'AVAILABLE',profilePhoto:'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80'},
 {childId:2,firstName:'Diya',lastName:'Sharma',gender:'FEMALE',age:4,dob:'2022-01-25',bloodGroup:'O+',education:'Pre-primary',hobbies:'Music, puzzles',medicalNotes:'No major medical concerns',specialNeeds:false,description:'Warm, expressive and loves music and stories.',status:'AVAILABLE',profilePhoto:'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80'},
 {childId:3,firstName:'Kabir',lastName:'Patel',gender:'MALE',age:8,dob:'2018-06-17',bloodGroup:'A+',education:'Grade 3',hobbies:'Reading, chess',medicalNotes:'Mild hearing impairment; uses hearing aid',specialNeeds:true,description:'Thoughtful and academically bright with a love for books.',status:'AVAILABLE',profilePhoto:'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=600&q=80'},
 {childId:4,firstName:'Anaya',lastName:'Rao',gender:'FEMALE',age:10,dob:'2016-02-03',bloodGroup:'AB+',education:'Grade 5',hobbies:'Dance, crafts',medicalNotes:'Healthy',specialNeeds:false,description:'Responsible, creative and supportive of younger children.',status:'AVAILABLE',profilePhoto:'https://images.unsplash.com/photo-1602030028438-4cf153cbae9e?auto=format&fit=crop&w=600&q=80'}
];

export const parentApplication={applicationId:101,applicationNumber:'APP-2026-0101',childId:2,childName:'Diya Sharma',appliedDate:'2026-07-14',status:'UNDER_REVIEW',visitDate:'2026-07-27',visitTime:'10:30',socialWorker:'Meera Joshi',visitStatus:'PENDING',adminRemark:'Documents verified. Home study is pending.'};

export const workerApplications=[
 {applicationId:101,applicationNumber:'APP-2026-0101',parentName:'Akash Battula',childName:'Diya Sharma',applicationDate:'2026-07-14',status:'UNDER_REVIEW',visitStatus:'PENDING',visitDate:'2026-07-27',visitTime:'10:30'},
 {applicationId:98,applicationNumber:'APP-2026-0098',parentName:'Rohan Verma',childName:'Aarav Kumar',applicationDate:'2026-07-09',status:'UNDER_REVIEW',visitStatus:'SCHEDULED',visitDate:'2026-07-26',visitTime:'14:00'},
 {applicationId:87,applicationNumber:'APP-2026-0087',parentName:'Sneha Iyer',childName:'Kabir Patel',applicationDate:'2026-06-28',status:'UNDER_REVIEW',visitStatus:'COMPLETED',visitDate:'2026-07-18',visitTime:'11:00',recommendation:'RECOMMENDED'}
];

export const parentDetails={name:'Akash Battula',age:25,gender:'MALE',occupation:'Software Engineer',annualIncome:'₹8,40,000',phone:'+91 98765 43210',email:'parent@aashray.demo',address:'12 Lake View Road, Pune, Maharashtra - 411001',maritalStatus:'MARRIED',familyMembers:3};
export const documents=['Aadhaar Card','PAN Card','Income Certificate','Address Proof','Marriage Certificate','Photograph'].map((name,i)=>({id:i+1,name,status:i<4?'VERIFIED':'PENDING',fileName:`${name.toLowerCase().replaceAll(' ','_')}.pdf`}));
