// Respect the first visible surface: a lamp/desk in front of a book must not
// behave like a transparent hit target for the chapter behind it.
export function chapterAtHit(hits,topics){
  let node=hits[0]?.object;
  while(node){
    const index=topics.findIndex(topic=>topic.id===node.userData?.storyId);
    if(index>=0)return index;
    node=node.parent;
  }
  return -1;
}

export function chapterCue(topic){
  if(!topic)return null;
  return {title:topic.name,hint:topic.ready?'Open this book · Story and playable world':'Preview this chapter · In development'};
}
