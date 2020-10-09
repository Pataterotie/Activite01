const Repository = require('../models/Repository');

module.exports =
    class BookmarksController extends require('./Controller') {
        constructor(req, res) {
            super(req, res);
            this.bookmarksRepository = new Repository('Bookmarks');
        }
        // GET: api/bookmarks
        // GET: api/bookmarks/{id}
        get(id) {
            let params = this.getQueryStringParams();
            console.log(this.req);
            if (this.req.url[this.req.url.length - 1] == '?') {
                this.response.JSON([{name : "retourne le signet avec le nom en param", 
                sort : "retourne la liste de signets en ordre croissant du parametre"}]);
            }
            if (params === null) {
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

            let newBookmark = this.bookmarksRepository.add(bookmark);
            if (newBookmark)
                this.response.created(newBookmark);
            else
                this.response.internalError();
        }
        // PUT: api/contacts body payload[{"Id":..., "Name": "...", "Email": "...", "Phone": "..."}]
        put(contact) {
            // todo : validate contact before updating
            if (this.contactsRepository.update(contact))
                this.response.ok();
            else
                this.response.notFound();
        }
        // DELETE: api/contacts/{id}
        remove(id) {
            if (this.contactsRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
        }

        searchStart = function (liste, chaine) {
            let tab = [];
            liste.forEach(element => {
                if (element.Name.length >= chaine.length) {
                    if (element.Name.slice(0, chaine.length) == chaine)
                        tab.push(element);
                }
            });
            return tab;
        }

        nettoyerParam = function (text) {
            text = text.trim();
            if (text[0] == '"' && text[text.length - 1] == '"') {
                text = text.slice(1, -1);
            }
            return text;
        }
    }