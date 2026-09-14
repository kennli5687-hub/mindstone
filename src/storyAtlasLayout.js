// A stable orthographic composition: keep the whole binding in frame on phones,
// while allowing the shallow library to fill a wide canvas.
export function storyFrustum(aspect,open=false){
  const safeAspect=Math.max(.25,Number.isFinite(aspect)?aspect:1);
  const height=Math.max(open?3.45:3.35,(open?4.6:5.0)/safeAspect);
  return {left:-height*safeAspect/2,right:height*safeAspect/2,top:height/2,bottom:-height/2};
}
