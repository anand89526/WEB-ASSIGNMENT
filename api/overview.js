// api/overview.js
export default function handler(req, res){
  const uni = (req.query.uni || 'amity').toLowerCase();
  const data = {
    amity: {
      name: "Amity University",
      description: "Amity is a private university offering a wide range of UG and PG programs in engineering, management, design and more."
    },
    cu: {
      name: "Chandigarh University",
      description: "Chandigarh University (CU) is a private university offering engineering, management and applied sciences with strong industry ties."
    }
  };
  res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=300');
  res.json(data[uni] || data.amity);
}
