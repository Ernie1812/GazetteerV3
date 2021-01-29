//news
if ( result.data.BingNews[0].image) {
    $('#imgArticleZero').attr("src", result.data.BingNews[0].image.contentUrl);
} else {
    $('#imgArticleZero').hide();
}
if ( result.data.BingNews[1].image) {
    $('#imgArticleOne').attr("src", result.data.BingNews[1].image.contentUrl);
} else {
    $('#imgArticleOne').hide();
}
if ( result.data.BingNews[2].image) {
    $('#imgArticleTwo').attr("src", result.data.BingNews[2].image.contentUrl);
} else {
    $('#imgArticleTwo').hide();
}
if ( result.data.BingNews[3].image) {
    $('#imgArticleThree').attr("src", result.data.BingNews[3].image.contentUrl);
} else {
    $('#imgArticleThree').hide();
}
if ( result.data.BingNews[4].image) {
    $('#imgArticleFour').attr("src", result.data.BingNews[4].image.contentUrl);
} else {
    $('#imgArticleFour').hide();
}

$('#txtArticleNameZero').text(result.data.BingNews[0].name);
$('#articleLinkZero').attr("href", result.data.BingNews[0].url);

$('#txtArticleNameOne').text(result.data.BingNews[1].name);
$('#articleLinkOne').attr("href", result.data.BingNews[1].url);

$('#txtArticleNameTwo').text(result.data.BingNews[2].name);
$('#articleLinkTwo').attr("href", result.data.BingNews[2].url);    

$('#txtArticleNameThree').text(result.data.BingNews[3].name);
$('#articleLinkThree').attr("href", result.data.BingNews[3].url);

$('#txtArticleNameFour').text(result.data.BingNews[4].name);

$('#articleLinkFour').attr("href", result.data.BingNews[4].url);



<div class="carousel-inner">
              <div class="carousel-item active">
                <img id="imgArticleZero" src="" class="w-100" alt="News Article Image">
                <div>
                  <h5 id="txtArticleNameZero"></h5>
                  <a  id="articleLinkZero" class="btn btn-info btn-sm" >Read article</a>
                </div>
              </div>

              <div class="carousel-item">
                <img id="imgArticleOne" src="" class="w-100" alt="News Article Image">
                <div>
                  <h5 id="txtArticleNameOne"></h5>
                  <button id="articleLinkOne" class="btn btn-info btn-sm" type="button" href="">Read article</button>
                </div>
              </div>

              <div class="carousel-item">
                <img id="imgArticleTwo" src="" class="w-100" alt="News Article Image">
                <div>
                  <h5 id="txtArticleNameTwo"></h5>
                  <button id="articleLinkTwo" class="btn btn-info btn-sm" type="button" href="">Read article</button>
                </div>
              </div>

              <div class="carousel-item">
                <img id="imgArticleThree" src="" class="w-100" alt="News Article Image">
                <div>
                  <h5 id="txtArticleNameThree"></h5>
                  <button id="articleLinkThree" class="btn btn-info btn-sm" type="button" href="">Read article</button>
                </div>
              </div>

              <div class="carousel-item">
                <img id="imgArticleFour" src="" class="w-100" alt="News Article Image">
                <div>
                  <h5 id="txtArticleNameFour"></h5>
                  <button id="articleLinkFour" class="btn btn-info btn-sm" type="button" href="">Read article</button>
                </div>





                <div id="carouselExampleControls" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
              <div class="carousel-item active">
                <div id="carImgDiv">
                <!-- <img id="imgArticleZero" src="" class="w-100" alt="News Article Image"> -->
                </div>
                <div>
                  <div id="articleInfo">
                    <!-- <h5 id="txtArticleNameZero"></h5>
                    <a id="articleLinkZero" href="">Read article</a> -->
                  </div>
                </div>
              </div>

              <!-- <div class="carousel-item">
                <img id="imgArticleOne" src="" class="w-100" alt="News Article Image">
                <div>
                  <h5 id="txtArticleNameOne"></h5>
                  <a id="articleLinkOne" href="">Read article  </a>
                </div>
              </div>

              <div class="carousel-item">
                <img id="imgArticleTwo" src="" class="w-100" alt="News Article Image">
                <div>
                  <h5 id="txtArticleNameTwo"></h5>
                  <a id="articleLinkTwo" href="">Read article</a>
                </div>
              </div>

              <div class="carousel-item">
                <img id="imgArticleThree" src="" class="w-100" alt="News Article Image">
                <div>
                  <h5 id="txtArticleNameThree"></h5>
                  <a id="articleLinkThree" href="">Read article</a>
                </div>
              </div>

              <div class="carousel-item">
                <img id="imgArticleFour" src="" class="w-100" alt="News Article Image">
                <div>
                  <h5 id="txtArticleNameFour"></h5>
                  <a id="articleLinkFour" href="">Read article</a>
                </div>
              </div> -->

            </div>
            <a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
            </a>
            <a class="carousel-control-next" href="#carouselExampleControls" role="button" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
            </a>
          </div>





          <div id="carouselExampleCaptions" class="carousel slide" data-bs-ride="carousel">
            <ol class="carousel-indicators">
              <li data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" class="active"></li>
              <li data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1"></li>
              <li data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2"></li>
            </ol>
            <div class="carousel-inner">
              <div class="carousel-item active">
                <img id="imgArticleZero" src="..." class="d-block w-100" alt="...">
                <div class="carousel-caption d-none d-md-block">
                  <h5 id="txtArticleNameOne"></h5>
                  <a  id="articleLinkZero" class="btn btn-info btn-sm" >Read article</a>
                </div>
              </div>
              <div class="carousel-item">
                <img id="imgArticleOne" src="..." class="d-block w-100" alt="...">
                <div class="carousel-caption d-none d-md-block">
                  <h5 id="txtArticleNameOne"></h5>
                  <a id="articleLinkOne" class="btn btn-info btn-sm" >Read article</a>
                </div>
              </div>
              <div class="carousel-item">
                <img id="imgArticleTwo" src="..." class="d-block w-100" alt="...">
                <div class="carousel-caption d-none d-md-block">
                  <h5 id="txtArticleNameTwo"></h5>
                  <a id="articleLinkTwo" class="btn btn-info btn-sm" >Read article</a>
                </div>
              </div>
            </div>
            <a class="carousel-control-prev" href="#carouselExampleCaptions" role="button" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
            </a>
            <a class="carousel-control-next" href="#carouselExampleCaptions" role="button" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
            </a>
          </div>