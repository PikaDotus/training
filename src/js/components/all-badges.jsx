/** @jsx React.DOM */

var fuzzy = require('fuzzy');

var Badges       = require('../lib/api/badges.js');
var EntityStates = require('../lib/entity-states.js');
var query        = require('../lib/query.js');

var allBadges = require('../state/badges.js');

var CortexReactivityMixin = require('../components/cortex-reactivity.js');
var LoadingPage           = require('../components/loading-page.js');

var Badge = React.createClass({
  mixins: [CortexReactivityMixin],
  reactToCortices: [allBadges()],

  render: function () {
    if (allBadges().loaded.val() !== EntityStates.LOADED
      || !allBadges().shouldRender.val()) {
      return <LoadingPage />;
    }

    if (!allBadges().loadedYears.val()) {
      this.loadYears();
      return <LoadingPage />;
    }

    var badges     = allBadges().badges.val();
    var categories = allBadges().categories.val();

    return <main className="badges">
      <div className="row">
        <br />
        <br />
        <br />

        <input type="text" name="search" ref="search" placeholder="Search here..."
               onChange={this.updateSearch} autoFocus />
        {this.renderSearch(badges)}
        {this.renderCategories(badges, categories)}
      </div>
    </main>;
  },

  getInitialState: function () {
    return {
      searchString: '',
    };
  },

  componentDidMount: function componentDidMount () {
    this.loadBadges();
    this.loadCategories();
  },

  updateSearch: function updateSearch (e) {
    this.setState({searchString: e.target.value});
  },

  renderSearch: function renderSearch (badges) {
    var searchString = this.state.searchString;
    if (!searchString) {
      return <div></div>;
    }

    var options = {
      extract: function (badge) {
        return badge.subcategory + ' ' + badge.name + ' ' + badge.subcategory;
      },
    };

    var results = fuzzy.filter(searchString, badges, options);

    var self = this;
    var badgeList = _.map(results, function (badge) {
      return self.renderBadge(badge.original, true);
    });

    return <div>
      <div>
        <ul className="small-block-grid-6 thumbnail-list">
          {badgeList}
        </ul>
      </div>
      <hr />
    </div>;
  },

  renderCategories: function renderCategories (badges, categories) {
    return _.map(categories, function (category) {
      if (!allBadges().val().shouldRender || !allBadges().val().shouldRender[category].any) {
        return <div key={Math.random()}>
          <div><a onClick={this.expandCategory}><h2>{category} ...</h2></a></div>
          <hr />
        </div>;
      }

      return <div key={Math.random()}>
        <div><a onClick={this.expandCategory}><h2>{category}:</h2></a></div>
        <div>
          <a href={'/category/' + category}><h3 className="subheader">See all {category}</h3></a>
          {this.renderBadgesByCategory(badges, category)}
        </div>
        <hr />
      </div>;
    }, this);
  },

  expandCategory: function expandCategory (e) {
    var category = e.target.innerHTML;

    var data = allBadges().shouldRender.val();
    data[category].any = !data[category].any;

    allBadges().shouldRender.set(data);
    this.forceUpdate();
  },

  expandYear: function expandYear(category, e) {
    var year = parseInt(e.target.innerHTML);
    if (!year) {
      return;
    }

    var data = allBadges().shouldRender.val();

    data[category][year] = !data[category][year];

    allBadges().shouldRender.set(data);
    this.forceUpdate();
  },

  renderBadge: function renderBadge (badge, search) {
    var pathToBadge = 'https://3501-training-2014-us-west-2.s3'
      + '.amazonaws.com/badges/' + badge.id + '.jpg';

    return <li key={badge.id + (search ? '-search' : null)} className="badge">
      <a href={'/badge/' + badge.id} className="cover">
        <Image src={pathToBadge} width={150} aspectRatio={1} transition="none" />
        <div className="cover">
          <h5>{this.trunc(badge.name, 15)}</h5>
          <p>{badge.subcategory}</p>
        </div>
      </a>
    </li>;
  },

  trunc: function trunc (str, n) {
    return str.length > n ? str.substr(0, n) + '...' : str;
  },

  renderBadges: function renderBadges (badges, year) {
    return _.map(_.compact(badges), function (badge) {
      if (badge.year === parseInt(year)) {
        return this.renderBadge(badge);
      }
    }, this);
  },

  renderBadgesByCategory: function renderBadgesByCategory (badges, category) {
    var years = _.omit(allBadges().val().shouldRender[category], 'any');

    badges = _.map(badges, function (badge) {
      if (badge.category && badge.category.toLowerCase() === category.toLowerCase()) {
        return badge;
      }
    });

    return _.map(years, function (shouldRender, year) {
      if (!shouldRender) {
        return <div key={Math.random()}>
          <div><a onClick={this.expandYear.bind(this, category)}><h3>{year} ...</h3></a></div>
        </div>;
      }

      return <div key={Math.random()}>
        <div><a onClick={this.expandYear.bind(this, category)}><h3>{year}:</h3></a></div>
        <div>
          <ul className="small-block-grid-6 thumbnail-list">
            {this.renderBadges(badges, parseInt(year))}
          </ul>
        </div>
      </div>;
    }, this);
  },

  loadBadges: function loadBadges () {
    if (allBadges().loaded.val() === EntityStates.LOADED) {
      return true;
    }

    allBadges().loaded.set(EntityStates.LOADING);

    Badges.all(function all (response) {
      if (response.status !== 200) {
        return;
      }

      var badges = response.all;

      allBadges().badges.set(badges);
      allBadges().loaded.set(EntityStates.LOADED);

      return true;
    });
  },

  loadCategories: function loadCategories () {
    var setShouldRender = function (categories) {
      if (allBadges().shouldRender.val()) {
        return true;
      }

      allBadges().shouldRender.set({});
      _.forEach(categories, function (category) {
        var data = allBadges().shouldRender.val();
        data[category] = {any: false};
        allBadges().shouldRender.set(data);
      });

      return true;
    }

    if (allBadges().categories.val()) {
      if (allBadges().shouldRender.val()) {
        return true;
      }

      return setShouldRender(allBadges().categories.val());
    }

    Badges.categories(function (response) {
      if (response.status !== 200) {
        return;
      }

      var categories = response.categories;

      allBadges().categories.set(categories);
      return setShouldRender(categories);
    });
  },

  loadYears: function loadYears () {
    if (allBadges().loadedYears.val()) {
      return;
    }

    _.forEach(allBadges().categories.val(), function (category) {
      var newVal = allBadges().shouldRender.val();

      var allYears = _.uniq(_.map(
        _.select(allBadges().badges.val(), function (badge) {
          return badge.category === category;
        }),
        function (badge) {
          return badge.year;
        })).sort();

      _.forEach(allYears, function (year) {
        newVal[category][year] = false;
      })

      allBadges().shouldRender.set(newVal);
    });

    allBadges().loadedYears.set(true);
  },
});

module.exports = Badge;
