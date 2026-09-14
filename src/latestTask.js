/** Only the most recent live request may affect the UI. Loads need not be abortable. */
export function createLatestTask(){
  let revision=0;
  return {
    invalidate(){revision++;},
    async run({load,isActive=()=>true,commit,fail}){
      const ticket=++revision;
      const isCurrent=()=>ticket===revision&&isActive();
      try{
        const result=await load();
        if(!isCurrent())return 'stale';
        commit(result);
        return 'committed';
      }catch(error){
        if(!isCurrent())return 'stale';
        fail(error,isCurrent);
        return 'failed';
      }
    },
  };
}
