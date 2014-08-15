/** @jsx React.DOM */

var applicationState = require('../state/application.js');
var Badges = require('../lib/api/badges.js');
var allBadges = require('../state/badges.js');
var profileState = require('../state/profile.js');
var EntityStates = require('../lib/entity-states.js');
var CortexReactivityMixin = require('../components/cortex-reactivity.js');
var LoadingPage = require('../components/loading-page.js');
var gravatar = require('gravatar');

var Profile = React.createClass({
  mixins: [CortexReactivityMixin],
  reactToCortices: [profileState(), allBadges()],

  render: function () {
    if (allBadges().loaded.val() !== EntityStates.LOADED
        || profileState().loaded.val() !== EntityStates.LOADED) {
      return <LoadingPage />;
    }

    var userBadges = profileState().badge_relations.val();
    var user = applicationState().auth.user.val();
    var candidateBadges = allBadges().badges.val();

    return <main>
      <div className="row">
        <div className="large-6 columns">
          <h1>banner here</h1>
        </div>
        <div className="large-6 columns">
          <ul className="button-group right">
            <li><a href="#" className="button">Home</a></li>
            <li><a href="#" className="button">Notifications</a></li>
            <li><a href="#" className="button">Badge Info</a></li>
          </ul>
        </div>
      </div>
      <br /><br />
      <div className="row">
        <div className="large-8 columns">
          <h1>{user.first_name + ' ' + user.last_name}</h1>
          <ul>
            <li><h3 className="subheader">{user.title ? user.title : null}</h3></li>
            <li><h3 className="subheader">{
              (user.technical_group ? user.technical_group : null) +
              (user.nontechnical_group ? (' / ' + user.nontechnical_group) : null)
            }</h3>
            </li></ul>
          <hr />
          <h2>BADGES</h2>
          <h4 className="subheader">Outreach:</h4>
          <ul className="small-block-grid-4">
            {this.renderBadgesByCategory(userBadges, 'Software', candidateBadges)}
          </ul>
          <br />
          <h4 className="subheader">Mechanical:</h4>
          <ul className="small-block-grid-4">
            {/*lis with imgs*/}
          </ul>
          <br />
          <h4 className="subheader">Electrical:</h4>
          <ul className="small-block-grid-4">
            {/*lis with imgs*/}
          </ul>
          <br />
          <h4 className="subheader">Software:</h4>
          <ul className="small-block-grid-4">
            {/*lis with imgs*/}
          </ul>
          <br />
          <h4 className="subheader">Public Relations:</h4>
          <ul className="small-block-grid-4">
            {/*lis with imgs*/}
          </ul>
          <br />
          <h4 className="subheader">Juggling:</h4>
          <ul className="small-block-grid-4">
            {/*lis with imgs*/}
          </ul>
        </div>
        <div className="large-4 columns">
          <img src={gravatar.url(user.email, {s: '250', r: 'pg'}, true)} /><hr />
          <div className="row">
            <div className="large-8 columns">
              <h5 style={{color: 'orange'}}>Outreach</h5>
              <h5 style={{color: 'orange'}}>Mechanical</h5>
              <h5 style={{color: 'orange'}}>  Gearbox Design</h5>
              <h5 style={{color: 'orange'}}>  Motor Physics</h5>
              <h5 style={{color: 'purple'}}>Electrical</h5>
              <h5 style={{color: 'purple'}}>  Printed Circuit Boards</h5>
              <h5 style={{color: 'green'}}>Software</h5>
              <h5 style={{color: 'blue'}}>Public Relations</h5>
              <h5 style={{color: 'red'}}>Juggling</h5>
            </div>
            <div className="large-4 columns">
              <h5 style={{color: 'orange'}}>4</h5>
              <h5 style={{color: 'orange'}}>4++</h5>
              <h5> </h5>
              <h5> </h5>
              <h5 style={{color: 'purple'}}>2+</h5>
              <h5> </h5>
              <h5 style={{color: 'green'}}>0</h5>
              <h5 style={{color: 'blue'}}>1</h5>
              <h5 style={{color: 'red'}}>3</h5>
            </div>
            <hr />
          </div>
        </div>
      </div>
    </main>;
  },
  renderBadgesByCategory: function renderBadgesByCategory (targetBadges, category, candidateBadges) {
    category = category.toLowerCase();

    var self = this;
    return _.map(targetBadges, function (targetBadge) {

      badge = _.find(candidateBadges, function (candidateBadge) {
        if (candidateBadge.id.toS() === targetBadge.badge_id.toS()) {
          return candidateBadge;
        }
      });

      if (badge.category && badge.category.toLowerCase() === category) {
        return self.renderBadge(badge, targetBadge.status);
      } else {
        return;
      }
    });
  },
  renderBadgeRelation: function renderBadgeRelation (targetBadge) {
    candidateBadges = allBadges().badges.val();
    badge = _.find(candidateBadges, function (candidateBadge) {
      if (candidateBadge.id === targetBadge.id) {
        return candidateBadge;
      }
    });

    return <li key={badge.id}>
      <a href={'/badges?id=' + badge.id}><img src={
        'http://placehold.it/200x150&text=' + badge.status} /></a>
    </li>;
  },
  renderBadge: function renderBadge (badge, status) {
    return <li key={badge.id}>
      <a href={'/badges?id=' + badge.id}><img src={
        'http://placehold.it/200x150&text=' + status} /></a>
    </li>;
  },
  renderNoBadges: function renderNoBadges (no) {
    var self = this;
    return _.map(no, function (badge) {
      return self.renderBadge(badge);
    });
  },
  renderReviewBadges: function renderReviewBadges (review) {
    var self = this;
    return _.map(review, function (badge) {
      return self.renderBadge(badge);
    });
  },
  renderYesBadges: function renderYesBadges (yes) {
    var self = this;
    return _.map(yes, function (badge) {
      return self.renderBadge(badge);
    });
  },
  loadUserBadges: function loadUserBadges () {
    if (profileState().loaded.val() === EntityStates.LOADED) {
      return false;
    }
    profileState().loaded.set(EntityStates.LOADING);

    var self = this;
    Badges.user_badges(function userBadges (response) {
      if (response.status !== 200) {
        return;
      }

      console.log(response.badge_relations);

      profileState().set({
        badge_relations: response.badge_relations,
        loaded: EntityStates.LOADED,
      });
    });
  },
  loadAllBadges: function loadAllBadges () {
    if (allBadges().loaded.val() === EntityStates.LOADED) {
      return false;
    }
    allBadges().loaded.set(EntityStates.LOADING);

    var self = this;
    Badges.all(function all (response) {
      if (response.status !== 200) {
        return;
      }

      allBadges().set({
        badges: response.all,
        loaded: EntityStates.LOADED,
      });
    });
  },
  componentDidMount: function componentDidMount () {
    this.loadUserBadges();
    this.loadAllBadges();
  },
});

module.exports = Profile;

