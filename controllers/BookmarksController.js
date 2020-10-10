const Repository = require('../models/Repository');
const Validator = require('../models/validator');
const Utilites = require('../utilities');

module.exports =
    class BookmarksController extends require('./Controller') {
        constructor(req, res) {
            super(req, res);
            this.bookmarksRepository = new Repository('Bookmarks'); 
            this.bookmarksValidation = new Validator();
        }
        // GET: api/bookmarks
        // GET: api/bookmarks/{id}
        get(id) {
            let params = this.getQueryStringParams();
            console.log(this.req);
            if (this.req.url[this.req.url.length - 1] == '?') {
                this.response.JSON(this.help());
            }
            else if (params === null) {
                if (!isNaN(id))
                    this.response.JSON(this.bookmarksRepository.get(id));
                else
                    this.response.JSON(this.bookmarksRepository.getAll());
            } else {

                let list = this.bookmarksRepository.getAll();
                if (params.sort != null) {
                    if (nettoyerParam(params.sort) === "name") {
                        list = list.sort(function (obj1, obj2) {
                            return obj1.Name > obj2.Name ? 1 : -1;
                        });
                    } else if (nettoyerParam(params.sort) === "category") {
                        list = list.sort(function (obj1, obj2) {
                            return obj1.Category > obj2.Category ? 1 : -1;
                        });
                    }
                }
                if (params.name != null) {
                    let param = this.nettoyerParam(params.name);
                    if (param[param.length - 1] === '*') {
                        list = this.searchStart(list, param.slice(0, -1))
                    } else {
                        for (var i = 0; i < list.length; ++i) {
                            if (list[i].Name == param) {
                                list = [list[i]];
                                break;
                            }
                        }
                    }
                }
                if (params.category != null) {
                    list = list.filter(function (obj) { return obj.Category == this.nettoyerParam(params.category) ? true : false })
                }
                this.response.JSON(list);
            }
        }

            
        // POST: api/bookmarks body payload[{"Id": 0, "Name": "...", "Url": "...", "Category": "..."}]
        post(bookmark) {
            if (this.bookmarksValidation.validateBookmark(bookmark.Name, bookmark.Url, bookmark.Category))
            {
                let newBookmark = this.bookmarksRepository.add(bookmark);
                if (newBookmark)
                    this.response.created(newBookmark);
                else
                    this.response.internalError();
            }
            else
                this.response.badRequest();
        } 
        // PUT: api/bookmarks body payload[{"Id":..., "Name": "...", "Url": "...", "Category": "..."}]
        put(bookmark) {
            let oldBookmark = this.bookmarksRepository.get(Utilites.decomposePath(this.req.url).id)
            if (typeof oldBookmark != "undefined") {
                // todo : validate contact before updating  
                oldBookmark.Name = bookmark.Name;
                oldBookmark.Url = bookmark.Url;
                oldBookmark.Category = bookmark.Category;
                if (this.bookmarksRepository.update(oldBookmark))
                    this.response.ok();
                else
                    this.response.notFound();
            }
        }
        // DELETE: api/bookmarks/{id}
        remove(id) {
            if (this.bookmarksRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
        }

        searchStart (liste, chaine) {
            let tab = [];
            liste.forEach(element => {
                if (element.Name.length >= chaine.length) {
                    if (element.Name.slice(0, chaine.length) == chaine)
                        tab.push(element);
                }
            });
            return tab;
        }

        nettoyerParam (text) {
            text = text.trim();
            if (text[0] == '"' && text[text.length - 1] == '"') {
                text = text.slice(1, -1);
            }
            return text;
        }

        help() {
            // expose all the possible query strings
            let content = "<div style=font-family:arial>";
            content += "<h3>GET : api/ endpoint  <br> List possible des parametres GET:</h3><hr>";
            content += "<h4>bookmarks retourne la liste des signets en ordre croissant d'Id </h4>";
            content += "<h4>bookmarks?sort=\"name\" retourne la liste des signets en ordre croissant de nom </h4>";
            content += "<h4>bookmarks?sort=\"category\" retourne la liste des signets en ordre croissant de catégorie</h4>";
            content += "<h4>bookmarks/id retourne le signet ayant ce id</h4>";
            content += "<h4>bookmark?name=\"nom\" retourne le signet qui contient ce nom</h4>";
            content += "<h4>bookmarks?name=\"ab*\" retourne la liste des signets qui ont ab comme préfixe</h4>";
            content += "<h4>bookmarks?category=\"sport\" retourne la liste de signets qui ont sport comme catégorie</h4>";
            content += "<h4>bookmark? retourne la liste des parametres pour faire une requete</h4>";
            content += "<h4>Post: api/bookmarks ajouter un signet</h4>";
            content += "<h4>Put: api/bookmarks/id modifier le signet qui contient ce id</h4>";
            content += "<h4>Delete: api/bookmarks/id supprimer le signet qui contient ce id</h4></div>";
            return content;
        }
    }