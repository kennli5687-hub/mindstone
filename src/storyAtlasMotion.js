// Frame-rate independent settling with an exact terminal value, so a paused
// scene stops issuing draws instead of asymptotically changing forever.
export function settleMotion(current,target,dt,instant=false){
  if(instant||Math.abs(target-current)<.0001)return target;
  return current+(target-current)*(1-Math.exp(-Math.max(0,Math.min(dt,.05))*12));
}
