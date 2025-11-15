// api/facilities.js
export default function handler(req,res){
  const uni = (req.query.uni || 'amity').toLowerCase();
  const data = {
    amity: ["Library", "Labs", "Hostel", "Sports Complex", "Incubation Center"],
    cu: ["Library", "Modern Labs", "Hostels", "Sports Stadium", "Placement Cell"]
  };
  res.setHeader('Cache-Control','s-maxage=60');
  res.json(data[uni] || []);
}
