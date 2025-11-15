// api/fees.js
export default function handler(req, res) {
  const uni = (req.query.uni || "amity").toLowerCase();

  const data = {
    amity: {
      courses: [
        { name: "B.Tech Computer Science", feeRange: { min: 180000, max: 250000 } },
        { name: "MBA", feeRange: { min: 300000, max: 450000 } },
        { name: "B.Des", feeRange: { min: 160000, max: 200000 } }
      ]
    },

    cu: {
      courses: [
        { name: "B.Tech Computer Science", feeRange: { min: 160000, max: 220000 } },
        { name: "MBA", feeRange: { min: 220000, max: 300000 } },
        { name: "BBA", feeRange: { min: 120000, max: 160000 } }
      ]
    }
  };

  res.setHeader("Cache-Control", "s-maxage=60");
  res.json(data[uni] || { courses: [] });
}
