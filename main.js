;
$(function() {
    window.app = {
        models: {},
        views: {},
        collections: {}
    }
    var template = function(id) {
        return _.template($('#' + id).html());
    }


    app.views.Search = Backbone.View.extend({
        el: '#search',
        events: {
            'input': 'search'
        },
        search: function() {
            var text = this.$el.val();
            app.views.Select.search = text;
            console.log("app.views.Select.search ", app.views.Select.search);
            return text;

        },
    })


    app.models.Option = Backbone.Model.extend({})
    app.views.Option = Backbone.View.extend({
        tagName: 'option',

        template: template('optionTemplate'),
        render: function() {



            this.$el.html(this.template(this.model));
            return this;
        },
    })


    app.models.ListItem = Backbone.Model.extend({})
    app.views.ListItem = Backbone.View.extend({
        tagName: 'li',

        template: template('listIteTemplate'),
        render: function() {



            this.$el.html(this.template(this.model));
            return this;
        },
    })

    app.collections.Select = Backbone.Collection.extend({
        model: app.models.Option,

    });

    app.views.Select = Backbone.View.extend({
        el: '.select',
        model: app.models.Select,

        initialize: function() {
            _.bindAll(this, 'on_keypress');
            $(document).bind('keydown', this.on_keypress);
        },
        render: function() {
            this.$el.find('select').html('');
            var collection = _.filter(this.collection.toJSON(), this.filter)
            collection = _.sortBy(collection, 'firstName', this)
            collection.forEach(this.addOption, this);
            return this;
        },

        renderList: function() {
            this.toggleList();
            this.$el.find('ul.dropdown-list').html('');
            var collection = _.filter(this.collection.toJSON(), this.filter)
            collection = _.sortBy(collection, 'firstName', this)
            collection.forEach(this.addListItem, this);
            return this;
        },
        events: {
            'input #search': function() {
                // this.render();
                this.renderList();
            },
            'click .dropdown-list li': 'selectValue',
            'click .emails li span': 'removeEmail'

        },
        filter: function(obj) {
            var text = new RegExp($('#search').val(), 'i');
            for (key in obj) {
                if (obj[key].search(text) === 0) return true;
            }
            return false;
        },
        toggleList: function() {
            if ($('input').val()) $('.dropdown-list').removeAttr('hidden');
            else $('.dropdown-list').attr('hidden', true);
        },
        on_keypress: function(e) {
            if (e.keyCode == 40) {
                $('.dropdown-list li.active').removeClass('active').next().addClass('active');
            }
            if (e.keyCode == 38) {
                $('li.active').removeClass('active').prev().addClass('active');
            }
            if (e.keyCode == 13) {
                var thisLi = $('.dropdown-list li.active');
                this.addMail(thisLi.text(), thisLi);
            }
        },
        selectValue: function(e) {
            var thisLi = $(e.target).closest('li')
            $('.dropdown-list li.active').removeClass('active');
            this.addMail(thisLi.text(), thisLi);
        },
        addMail: function(credentials, li) {
            var lastSpace = credentials.lastIndexOf(' '),
                mail = credentials.slice(lastSpace);
            $('.emails').append('<li>' + mail + '<span>×</span></ li>');
            li.next().addClass('active')
            li.remove();
        },
        removeEmail: function(e) {
            li = $(e.target).closest('li')
            li.remove();
            item = _.find(this.collection.toJSON(), function(item) {
                return item.email === li.text().replace('×', '').trim()
            }, this)
            this.addListItem(item)
        },
        addOption: function(opt) {
            var option = new app.views.Option({ model: opt });
            this.$el.find('select').append(option.render().el);
        },
        addListItem: function(item, index) {
            var li = $('<li>'),
                value = $('#search').val(),
                regExp = new RegExp(strong, 'i'),
                strong = value.charAt(0).toUpperCase() + value.slice(1),
                str = '';

            if (index > 4) return;

            if (strong) {
                for (key in item) {
                    if (key === '_id') continue;
                    if (item[key].search(regExp) === 0) {
                        if (key === 'email') {
                            str += (item[key].replace(regExp, '<strong>' + strong + '</strong>')).toLowerCase();
                        } else {
                            str += item[key].replace(regExp, '<strong>' + strong + '</strong>') + ' ';
                        }
                    } else {
                        if (key === 'email') {
                            str += item[key];
                        } else {
                            str += item[key] + ' ';
                        }
                    }
                }
            }
            if (!$('.dropdown-list .active').length) li.addClass('active');
            this.$el.find('ul.dropdown-list').append(li.append(str));
        }
    })
    $.getJSON("data.json").success(function(data) {
        app.selectCollection = new app.collections.Select(data);
        app.selectView = new app.views.Select({ collection: app.selectCollection });
        $('.select').append(app.selectView.renderList());
    })
})