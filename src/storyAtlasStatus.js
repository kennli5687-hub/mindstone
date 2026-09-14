// Resolve preview feedback from the visible chapter, not callback arrival order.
export function previewStatus({unavailable=false,contextLost=false,selected=-1,library=false,book=false,libraryFailed=false,bookFailed=false}){
  if(unavailable)return {fallback:true,message:'3D preview unavailable. You can still choose a story below.'};
  if(contextLost)return {fallback:true,message:'3D paused by your browser. Story navigation is still available.'};
  if(selected===0){
    if(book)return {fallback:false,message:''};
    return {fallback:!library,message:bookFailed?'The 3D chapter could not load. Select Avoidance to retry, or meet Mira below.':'Opening Mira’s chapter…'};
  }
  if(library)return {fallback:false,message:''};
  return {fallback:true,message:libraryFailed?'Preview artwork is shown. Choose a story below.':'Preparing the story library…'};
}
