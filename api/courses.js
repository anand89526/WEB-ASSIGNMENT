// api/courses.js
export default function handler(req,res){
  const uni = (req.query.uni || 'amity').toLowerCase();
  const data = {
    amity: [
      { name: "B.Tech Computer Science", duration: "4 years" },
      { name: "MBA", duration: "2 years" },
      { name: "B.Des", duration: "4 years" }
    ],
    cu: [
      { name: "B.Tech Computer Science", duration: "4 years" },
      { name: "MBA", duration: "2 years" },
      { name: "BBA", duration: "3 years" }
    ]
  };
  res.setHeader('Cache-Control','s-maxage=60');
  res.json(data[uni] || []);
}
