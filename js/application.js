//= require polyfills/function_bind
//= require jquery
//= require jquery_ujs
//= require peek
//= require peek/views/performance_bar
//= require ga
//= require capture_referrer
//= require signup_form
//= require onboarding_hooks
//= require action_menu
//= require repo_select
//= require issue_filtering
//= require ajax_modals
//= require dropdown
//= require auto_show_modal
//= require ellipsis_toggle
//= require smells
//= require inferred_config
//= require vendor/jquery.sortElements
//= require vendor/jquery.tipTip.minified
//= require vendor/jquery.timeago
//= require vendor/jquery.cookie
//= require vendor/jquery.ba-bbq
//= require vendor/jquery.bigtarget.1.0.1.js
//= require vendor/jquery.pulse
//= require vendor/jquery.color
//= require vendor/jquery.easytabs
//= require vendor/jquery.validate
//= require vendor/jquery.payment.min
//= require vendor/jbar
//= require vendor/spin
//= require vendor/guiders-1.2.8
//= require vendor/segment.io
//= require vendor/kissmetrics
//= require vendor/prism
//= require vendor/prism.clojure
//= require vendor/prism.plain
//= require vendor/selectize.min
//= require vendor/remodal
//= require prism_ext
//= require integrations
//= require vendor/ZeroClipboard

jQuery.validator.addMethod("oneletter", function(value, element) {
  return this.optional(element) || (value.length > 10) || /[a-z]/i.test(value);
}, "Please include at least one letter.");

jQuery.validator.addMethod("onenumber", function(value, element) {
  return this.optional(element) || (value.length > 10) || /[0-9]/i.test(value);
}, "Please include at least one number.");

$(function() {
  $('.js-ga-event').each(function() {
    var eventCategory = $(this).data('category');
    var eventAction = $(this).data('action');
    _gaq.push(['_trackEvent', eventCategory, eventAction]);
  });
});

jQuery(document).ready(function() {
  jQuery("abbr.timeago").timeago();
});

function number_with_delimiter(number, delimiter) {
    var number = number + '', delimiter = delimiter || ',';
    var split = number.split('.');
    split[0] = split[0].replace(
        /(\d)(?=(\d\d\d)+(?!\d))/g,
        '$1' + delimiter
    );
    return split.join('.');
};

function flashNotice(text) {
  $(".flash.notice").remove();
  var notice = $("<div class='flash notice'>" + text + "</div>");

  if (!$(".flash_wrapper").length) {
    $("<div class='flash_wrapper'></div>").prependTo(".main_content");
  }

  notice.hide().prependTo(".flash_wrapper").slideDown();
}

function flashAlert(text) {
  $(".flash.alert").remove();
  var alert = $("<div class='flash alert'>" + text + "</div>");

  if (!$(".flash_wrapper").length) {
    $("<div class='flash_wrapper'></div>").prependTo(".main_content");
  }

  alert.hide().prependTo(".flash_wrapper").slideDown();
}

function checkSnapshotStatus(repoId) {
  $.getJSON("/repos/" + repoId + "/snapshots/last.json", function(data) {
    if (data.finished_at) {
      $(".refresh.spinning").removeClass("spinning");
      flashNotice("Your repo is now up-to-date! Refresh the page to see your newest info.");
    } else {
      setTimeout(function() {
        checkSnapshotStatus(repoId);
      }, 1000);
    }
  });
}

function checkRepoStatus(statusUrl, options) {
  $.getJSON(statusUrl, function(data) {
    if (data["status"] == "success") {
      options.success();
    } else if (data["status"] == "failed") {
      options.failure();
    } else {
      setTimeout(function() {
        checkRepoStatus(statusUrl, options);
      }, 500);
    }
  });
}

$(function() {
  $("form.please_wait").submit(function() {
    var form = $(this);
    form.addClass('submitting').find('*[type=submit], button').attr('disabled', 'disabled').text('Please wait...');
  });

  $(".tooltip").tipTip({delay: 200, maxWidth: "350px"});
  $(".tooltip_right").tipTip({delay: 200, maxWidth: "350px", defaultPosition: "right"});
  $(".tooltip_left").tipTip({delay: 200, maxWidth: "350px", defaultPosition: "left"});
  $(".tooltip_top").tipTip({delay: 200, maxWidth: "350px", defaultPosition: "top"});

  $("a[data-row-bigtarget]").bigTarget({clickZone: "tr"});

  $(document).on("click", "#oss_cta a.close", function() {
    $.cookie("closed_oss_cta", "1", { path: "/", expires: 90 });
    $("#oss_cta").slideUp();
    return false;
  });

  var trackEvent = function(eventName){
    var nameWithSep = eventName.split(" ").join("+");
    var eventPixel  = "<img src=\"/t?n=" + nameWithSep + "\" width=\"1\" height=\"1\">";
    $("#event_pixels").append(eventPixel);
  };

  if (window.location.pathname.indexOf('/github/') == 0) {
    if (!$.cookie("was_user")) {
      if ($.cookie("seg") % 2 == 0){
        $("#github-cta").show();
        trackEvent("Viewed 2014-11-18 Gray CTA Bar");
       } else {
        $("#github-cta-orange").show();
        trackEvent("Viewed 2014-11-18 Orange CTA Bar");
      }
    }
  }

  $(document).on("click", "a.show_code", function() {
    var link = $(this)
      , li = link.closest(".code_container")
      , code = li.find("pre:first:not(.truncated)");

    if (!li[0].ajaxRunning) {
      if (code.length === 0) {
        li[0].ajaxRunning = true;
        $.get($(this).data("url"), function(data) {
          var truncatedCode = li.find("pre.truncated");

          if (truncatedCode.length) {
            truncatedCode.replaceWith(data);
            li.find(".show_code").remove();
          } else {
            li.append(data);
          }
          Prism.highlightAll();
          li[0].ajaxRunning = false;
        });
      } else {
        if (code.is(":visible")) {
          code.hide();
        } else {
          code.show();
        }
      }
    }

    return false;
  });

  $(document).on("click", "a.show_duplication", function() {
    var link = $(this)
      , li = link.closest(".duplication_container")
      , code = li.find("pre");

    if (!li[0].ajaxRunning) {
      if (code.length === 0) {
        li[0].ajaxRunning = true;
        $.get($(this).data("url"), function(data) {
          li.append(data);
          Prism.highlightAll();
          li[0].ajaxRunning = false;
        });
      } else {
        if (code.is(":visible")) {
          code.hide();
        } else {
          code.show();
        }
      }
    }

    return false;
  });

  $(document).on("click", "a.show_other_locations", function() {
    $(this).parent().next(".other-locations").toggle();
    return false;
  });

  $("table.sortable").each(function() {
    var sortedTh, params, table = $(this);
    params = jQuery.deparam.querystring();

    if (params.sort) {
      table.find(".sort_arrow").remove();
      table.find(".sorted").removeClass("sorted");
      table.find("[data-sort-field='" + params.sort + "']").addClass("sorted");
    }

    table.find("th:not(.unsortable)").each(function() {
      var th = $(this)
        , thIndex = th.index()
        , inverse = false
        , numeric = th.hasClass("numeric");

      th.click(function() {
        var params, newDirection, newUrl, newParams;

        params = jQuery.deparam.querystring();
        delete params.page;

        newParams = { sort: th.data("sortField") };
        if (params.q) {
          newParams.q = params.q;
        }

        if (params.sort == th.data("sortField")) {
          if (params.sort_direction == "desc") {
            newParams.sort_direction = "asc";
          } else {
            newParams.sort_direction = "desc";
          }
        } else {
          if (newParams.sort == "name" || newParams.sort == "constant_name") {
            newParams.sort_direction = "asc";
          } else {
            newParams.sort_direction = "desc";
          }
        }

        newUrl = $.param.querystring(window.location.href, newParams, 2);
        window.location.href = newUrl;
        return false;
      });
    });
  });
});

$(function() {
  $("body").on("click", ".change_branch", function() {
    $(this).closest(".branch_text").hide();
    $(this).closest(".inputs").find(".branch_input").show();
    return false;
  });

  $(".refresh.spinning").each(function() {
    var elem = $(this);
    setTimeout(function() {
      checkSnapshotStatus(elem.attr('data-repo-id'));
    }, 6000);
  });

  if ($(".tab.failing").length) {
    var tabId = $(".tab.failing").first().attr("id");
    $("#smells-container").easytabs({animate: false, defaultTab: ("#" + tabId)});
  } else {
    $("#smells-container").easytabs({animate: false});
  }

  $("#login_form_email").focus();

  $("body").on("click", "#add_more", function() {
    var row = $(this).closest("li");
    for (var i = 0; i < 5; i++) {
      row.before($("#blank_row").clone().show());
    }
    return false;
  });

  $("#partner-tabs").easytabs({
    defaultTab: "span#tab-1",
    panelActiveClass: "active-content-div",
    tabActiveClass: "selected-tab",
    tabs: "> div > span",
    updateHash: false
  });


});

// USER PROFILE
function ExpandOptions(name, $elem) {
  this.name   = name;
  this.$radio = $("#" + this.name + "_true");
  this.$elem  = $elem;
}

ExpandOptions.prototype.toggle = function() {
  if (this.$radio.is(":checked")) {
    this.$elem.hide();
  } else {
    this.$elem.show();
  }
};

ExpandOptions.prototype.init = function() {
  var ids  = "#" + this.name + "_true, #" + this.name + "_false"
    , self = this;

  $(ids).change(function() { self.toggle(); });

  this.toggle();
};

$(function() {
  new ExpandOptions("user_no_emails", $(".email_choices")).init();
  new ExpandOptions("user_notify_all_projects", $(".project_list")).init();
});

$(function () {

  var highlightToggle = {
    toSmells: function(elem) {
      var codeWrapper = $(elem).closest(".source_code");
      codeWrapper.addClass("highlight_smells").removeClass("highlight_coverage");
      $(elem).closest(".source_code").find(".bool-slider").addClass("true").removeClass("false");
    },

    toCoverage: function(elem) {
      var codeWrapper = $(elem).closest(".source_code");
      codeWrapper.removeClass("highlight_smells").addClass("highlight_coverage");
      $(elem).closest(".source_code").find(".bool-slider").addClass("false").removeClass("true");
    }
  };

  $('.bool-slider .control').click(function () {
    var toggled = $(this).parents('.bool-slider').hasClass("true");

    if (toggled) {
      highlightToggle.toCoverage(this);
    } else {
      highlightToggle.toSmells(this);
    }

    return false;
  });

  $('.js-highlight-smells').click(function () {
    highlightToggle.toSmells(this);
    return false;
  });

  $('.js-highlight-coverage').click(function () {
    highlightToggle.toCoverage(this);
    return false;
  });

  $("body").on("click", ".js-issue-filters a", function() {
    var category = $(this).data().issueFilter;
    filterIssuesByCategory(category);
    window.location.hash = "#" + category;
    return false;
  });

  $("#credit-card-notice .js-snooze").click(function(e) {
    $.post($(this).data("url")); // Ignores failure
    $("#credit-card-notice").slideUp();

    e.preventDefault();
  });
});
