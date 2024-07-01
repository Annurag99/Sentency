$(document).ready(function(){
  $('.delete-sentence').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type:'DELETE',
      url: '/sentences/'+id,
      success: function(response){
        alert('Deleting Sentence');
        window.location.href='/';
      },
      error: function(err){
        console.log(err);
      }
    });
  });
});
