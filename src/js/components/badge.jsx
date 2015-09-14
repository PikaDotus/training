/** @jsx React.DOM */

var pagedown  = require('pagedown');

var Badges       = require('../lib/api/badges.js');
var EntityStates = require('../lib/entity-states.js');
var loadBadges   = require('../lib/load/badges.js');

var CortexReactivityMixin = require('../components/cortex-reactivity.js');
var LoadingPage           = require('../components/loading-page.js');
var UsersPerBadge         = require('../components/users-per-badge.js');

var allBadges        = require('../state/badges.js');
var applicationState = require('../state/application.js');
var desiredBadge     = require('../state/badge.js');

var converter = new pagedown.getSanitizingConverter();

var Badge = React.createClass({
  mixins: [CortexReactivityMixin],
  reactToCortices: [desiredBadge(), allBadges()],

  render: function () {
    var permissions = applicationState().auth.user.permissions;

    if (desiredBadge().loaded.val() !== EntityStates.LOADED
      || (permissions && !desiredBadge().relations)) {
      return <LoadingPage />;
    }

    permissions = permissions ? permissions.val() : 'student';

    var badge       = desiredBadge().badge.val();
    var studentHash = desiredBadge().relations.val();

    var pathToBadge = 'https://3501-training-2014-us-west-2.s3'
      + '.amazonaws.com/badges/' + badge.id + '.jpg';

    var description    = converter.makeHtml(badge.description || '');
    var learningMethod = converter.makeHtml(badge.learning_method || '');
    var resources      = converter.makeHtml(badge.resources || '');

    return <main className="badge">
      <div>
        <div className="row">
          <br /><br />

          <div className="small-4 large-4 column">
            <Image width={300} src={pathToBadge} aspectRatio={1} transition="none" />
            <br /><br />
            <div className="row">

              <hr />
              <div className="small-9 large-6 column">
                <p>Category:</p>
                <p>Year:</p>
                <p>Verifiers:</p>
              </div>

              <div className="small-3 large-6 column">
                <p>{badge.category}</p>
                <p>{(badge.year === 0) ? 'Perpetual' : badge.year}</p>
                <p>{badge.verifiers}</p>
              </div>

              <hr />
              {permissions === 'mentor' || permissions === 'lead'
                ? <div>
                  <a className="button" href={'/badge/' + badge.id + '/edit'}
                    >Edit badge</a>
                  <a className="button" href={'/badge/' + badge.id + '/assign'}
                    >Assign badge</a>
                </div>
                : null}
            </div>
          </div>

          <div className="small-8 large-8 column">
            <div className="row"><h1>{badge.name} <small>{
              badge.subcategory}</small></h1></div>
            <br />

            <h3 className="subheader">Requirements:</h3>
            <span dangerouslySetInnerHTML={{__html: description}} />

            <h3 className="subheader">Learning methods:</h3>
            <span dangerouslySetInnerHTML={{__html: learningMethod}} />

            <br />
            <div className="row">
              <div className="large-6 columns">
                <h3 className="subheader">Resources / Dates:</h3>
                <span dangerouslySetInnerHTML={{__html: resources}} />
              </div>

              <div className="large-6 columns">
                <h3 className="subheader">Need help? </h3>
                <p>Ask someone who's already received the badge. Or ask one of
                  the verifiers to be a <a href="http://en.wikipedia.org/wiki/HTTP_302">human 302.</a></p>
              </div>
            </div>

            <br />
            <br />
            <h3>Users with this badge:</h3>
            <br />
            <br />
            <UsersPerBadge studentHash={studentHash} />
          </div>

        </div>
      </div>
    </main>;
  },

  loadBadge: function loadBadge () {
    var self = this;

    var cachedBadge;
    if (allBadges().badges.val()) {
      cachedBadge = _.find(allBadges().badges.val(), function (badge) {
        return badge.id.toS() === self.props.id;
      });

      if (cachedBadge) {
        desiredBadge().badge.set(cachedBadge);
        desiredBadge().loaded.set(EntityStates.LOADED);

        return;
      }
    }

    desiredBadge().loaded.set(EntityStates.LOADING);

    Badges.badge(this.props.id, function all (response) {
      if (response.status !== 200) {
        return;
      }

      desiredBadge().badge.set(response.badge);
      desiredBadge().loaded.set(EntityStates.LOADED);
    });
  },

  componentDidMount: function componentDidMount () {
    this.loadBadge();
    loadBadges.perBadge(this.props.id);
  },
});

module.exports = Badge;
