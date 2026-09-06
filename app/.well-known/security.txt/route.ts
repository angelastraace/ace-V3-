export async function GET(){
  const body=["Contact: mailto:security@aceexchange.io","Canonical: https://www.aceexchange.io/.well-known/security.txt","Policy: https://www.aceexchange.io/security","Preferred-Languages: en, sv, no","Expires: 2027-09-06T00:00:00.000Z"].join("\n");
  return new Response(body,{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=86400"}});
}
