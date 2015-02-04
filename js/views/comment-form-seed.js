var constants = require("../util/constants");
var View = require("handlebones").View;
var template = require("../tmpl/comment-form-seed");
var CommentModel = require("../models/comment");
var CommentView = require("../views/commentView");
var Handlebones = require("handlebones");
var serialize = require("../util/serialize");


var CommentsByMeView = Handlebones.CollectionView.extend({
  modelView: CommentView
});


module.exports = Handlebones.View.extend({
  name: "comment-form-seed",
  template: template,
    events: {
    "click #comment_button": function(e){
      var that = this;
      e.preventDefault();
      serialize(this, function(attrs){
        that.participantCommented(attrs);
      });
      $("#comment_form_textarea").val(""); //use this.$
    }
  },
  buttonActive: true,
  textChange: function() {
    var formText = $(arguments[0].target).val();
    var len = formText.length;
    var remaining = CHARACTER_LIMIT - len;
    var txt;
    if (remaining < 0) {
      // txt = "- " + remaining;
      txt = remaining;
      this.$("#commentCharCount").css("color", "red");
      this.$("#comment_button").attr("disabled", "disabled");
      this.$("#comment_button").css("opacity", 0.3);
      this.$("#commentTooLongAlert").show();
      this.buttonActive = false;
    } else if (remaining > 0) {
      txt = "+ " + remaining;
      this.$("#commentCharCount").css("color", "black");
      this.$("#comment_button").attr("disabled", null);
      this.$("#comment_button").css("opacity", 1);
      this.$("#commentTooLongAlert").hide();
      this.buttonActive = true;
    } else {
      txt = remaining;
      this.$("#commentCharCount").css("color", "black");
      this.$("#comment_button").attr("disabled", null);
      this.$("#comment_button").css("opacity", 1);
      this.$("#commentTooLongAlert").hide();
      this.buttonActive = true;
    }
    this.$("#commentCharCount").text(txt);
    if (formText.indexOf("?") >= 0) {
      this.$("#commentNotQuestionAlert").show();
    } else {
      this.$("#commentNotQuestionAlert").hide();
    }
  },
  participantCommented: function(attrs) {
    var that = this; //that = the view
    attrs.pid = this.pid;
    attrs.conversation_id = this.conversation_id;
    attrs.vote = constants.REACTIONS.PASS; // Preseeded comments are automatically passed. Needed for now since math assumes every comment has at least one vote.
    attrs.prepop = true; // this is a prepopulated comment
    var comment = new CommentModel(attrs);
    comment.save().then(function() {
      that.trigger("commentSubmitted"); // view.trigger
      that.updateCollection();
    }, function(err) {
      console.error("failed to send comment");
      console.error(err)
    });
  },
  updateCollection: function() {
    this.collection.fetch({
      data: $.param({
        conversation_id: this.conversation_id
      })
    });
  },
  initialize: function(options) {
    this.conversation_id = options.conversation_id;
    this.pid = options.pid;
    this.collection = options.collection; // comments by me collection
    this.commentsByMeView = this.addChild(new CommentsByMeView({
      collection: this.collection
    }));
  }
});