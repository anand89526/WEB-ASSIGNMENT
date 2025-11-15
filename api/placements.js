// api/placements.js
export default function handler(req,res){
  const uni = (req.query.uni || 'amity').toLowerCase();
  const data = {
    amity: {
      top_recruiters: ["Google", "TCS", "Infosys", "Wipro"],
      avg_package: "6.5 LPA",
      details: { highest: "35 LPA", year: 2024 }
    },
    cu: {
      top_recruiters: ["Amazon", "Accenture", "Capgemini", "IBM"],
      avg_package: "7.0 LPA",
      details: { highest: "40 LPA", year: 2024 }
    }
  };
  res.setHeader('Cache-Control','s-maxage=60');
  res.json(data[uni] || {});
}
