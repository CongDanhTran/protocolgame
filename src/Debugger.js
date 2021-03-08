function showStep(showStep){
    $("[data-step]").css("color", "black").css("font-weight", "normal");
    $(".message[data-step]").css("color", "green").css("font-weight", "normal");	
    $("[data-step="+showStep+"]").css("color", "red").css("font-weight", "bold");

    $("[data-step]:not(.lineno)").each(function(){
            var step = $(this).data("step");
            if(step === "S") step = 0;
            if( showStep > step){
                if($(this).hasClass("message")){
                    $(this).css("display", "list-item");
                }else{
                    $(this).css("display", "inline");
                }						
            }else if( showStep == step){					
                $(this).css("display", "inline");
            }
            else{
                $(this).css("display", "none");
            }
                        
    });
}