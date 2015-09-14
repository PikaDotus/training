/** @jsx React.DOM */

var Badges       = require('../lib/api/badges.js');
var EntityStates = require('../lib/entity-states.js');
var redirect     = require('../lib/redirect.js');

var allBadges    = require('../state/badges.js');
var desiredBadge = require('../state/badge.js');

var CortexReactivityMixin = require('../components/cortex-reactivity.js');
var LoadingPage           = require('../components/loading-page.js');

var EditState = {
  EDITING: 1,
  LOADING: 2,
  FAILED: 3,
  SUCCESS: 4,
};

var EditBadge = React.createClass({
  mixins: [CortexReactivityMixin],
  reactToCortices: [desiredBadge()],

  render: function () {
    if (desiredBadge().loaded.val() !== EntityStates.LOADED) {
      return <LoadingPage />;
    }

    var badge = desiredBadge().badge.val();
    var pathToBadge = 'https://3501-training-2014-us-west-2.s3'
      + '.amazonaws.com/badges/' + badge.id + '.jpg';

    return <main className="badge">
      <form onSubmit={this.submit}>
        <div className="row">
          <br /><br />
          <div className="large-4 column">
            <a href={'/badge/' + badge.id + '/edit/image'}>
              <Image width={300} src={pathToBadge} aspectRatio={1} transition="none" />
            </a>
            <br /><br />
            <div className="row">
              <hr />
              <div className="large-6 column">
                <p>Category:</p>
                <p>Year (0 = perpetual):</p>
                <p>Verifiers:</p>
              </div>
              <div className="large-6 column">
                <input type="text" name="category" ref="category"
                  placeholder="Main badge category" defaultValue={badge.category} />
                <input type="number" name="year" ref="year" defaultValue={badge.year} />
                <textarea placeholder="Who can check this badge off?" rows="2"
                  ref="verifiers" defaultValue={badge.verifiers} />
              </div>
              <a className="button" href={'/badge/' + badge.id} >Stop editing</a>
              <a className="button" onClick={this.deleteBadge}>Delete badge</a>
            </div>
          </div>
          <div className="large-8 column">
            <div className="row"><h1>
              <div className="large-4 columns">
                <label>Name
                  <input type="text" name="name" ref="name"
                    defaultValue={badge.name} placeholder="Badge name" />
                </label>
              </div>
              <div className="large-4 columns end">
                <small>
                  <label>Nickname
                    <input type="text" name="subcategory" ref="subcategory"
                      placeholder="Badge nickname" defaultValue={badge.subcategory} />
                  </label>
                </small>
              </div>
            </h1></div>

            <h3 className="subheader">Requirements:</h3>
            <textarea defaultValue={badge.description} rows="4"
              ref="description" />
            <h3 className="subheader">Learning methods:</h3>
            <textarea defaultValue={badge.learning_method} rows="4"
              ref="learning_method" />
            <br />
            <div className="row">
              <div className="large-6 columns">
                <h3 className="subheader">Resources / Dates:</h3>
                <textarea defaultValue={badge.resources} rows="3"
                  ref="resources" />
              </div>
              <div className="large-6 columns">
                <h3 className="subheader">Need help? </h3>
                <p>Ask someone who's already received the badge. Or ask one of
                  the verifiers to be a <a href="http://en.wikipedia.org/wiki/HTTP_302">human 302.</a></p>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="large-4 columns">
                <input type="submit" className={'button alert'
                  + (this.state.state === EditState.LOADING ? ' disabled' : '')}
                  value="Submit changes" />
              </div>
              <div className="large-4 columns">
                {this.state.message}
              </div>
              <div className="large-4 columns">
                <p><i>All content parsed as <a
                  href="http://daringfireball.net/projects/markdown/syntax">Markdown.
                </a></i></p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>;
  },

  getInitialState: function () {
    return {
      state: EditState.EDITING,
      message: '',
    };
  },

  componentDidMount: function componentDidMount () {
    this.loadBadge();
  },

  deleteBadge: function deleteBadge () {
    if (!confirm('Delete this badge?')) {
      return;
    }

    var self = this;

    Badges.delete_badge(this.props.id, function (response) {
      if (response.status !== 200) {
        self.setState({state: EditState.FAILED, message: response.message});
        return;
      }

      alert(response.message);
      redirect('/badges');
    });
  },

  getValue: function getValue(ref) {
    return this.refs[ref].getDOMNode().value.trim();
  },

  submit: function submit () {
    if (this.state.state === EditState.LOADING) {
      return false;
    }

    this.setState({state: EditState.LOADING, message: 'Submitting changes...'});

    var name           = this.getValue('name');
    var subcategory    = this.getValue('subcategory');
    var category       = this.getValue('category');
    var year           = parseInt(this.refs.year.getDOMNode().value);
    var description    = this.getValue('description');
    var learningMethod = this.getValue('learning_method');
    var resources      = this.getValue('resources');
    var verifiers      = this.getValue('verifiers');

    if (!name || !subcategory || !category || !resources || !verifiers
     || !description || !learningMethod) {

      this.setState({
        state: EditState.EDITING,
        message: 'Make sure all fields are filled in.'
      });

      return false;
    }

    var currentBadge = desiredBadge().badge.val();
    var delta = {};

    if (name !== currentBadge.name)
      delta.name = name;
    if (subcategory !== currentBadge.subcategory)
      delta.subcategory = subcategory;
    if (category !== currentBadge.category)
      delta.category = category;
    if (year !== currentBadge.year)
      delta.year = year;
    if (description !== currentBadge.description)
      delta.description = description;
    if (learningMethod !== currentBadge.learning_method)
      delta.learning_method = learningMethod;
    if (resources !== currentBadge.resources)
      delta.resources = resources;
    if (verifiers !== currentBadge.verifiers)
      delta.verifiers = verifiers;

    if (_.size(delta) === 0) {
      this.setState({
        state: EditState.EDITING,
        message: "No changes made."
      });

      return false;
    }

    var self = this;
    Badges.update(this.props.id, delta, function (response) {
      if (response.status !== 200) {
        self.setState({state: EditState.FAILED, message: response.message});
      } else {
        var originalData = desiredBadge().badge.val();
        desiredBadge().badge.set(_.merge(originalData, delta));

        self.setState({state: EditState.SUCCESS, message: "Badge saved."});
      }
    });

    return false;
  },

  loadBadge: function loadBadge () {
    var self = this;

    if (allBadges().badges.val()) {
      var cachedBadge = _.find(allBadges().badges.val(), function (badge) {
        return badge.id.toS() === self.props.id;
      });

      if (cachedBadge) {
        desiredBadge().badge.set(cachedBadge);
        desiredBadge().loaded.set(EntityStates.LOADED);

        return;
      }
    }

    if (desiredBadge().badge.val()
      && desiredBadge().badge.val().id
      && desiredBadge().badge.val().id.toS() === this.props.id
      && desiredBadge().loaded.val() === EntityStates.LOADED) {
      return false;
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
});

module.exports = EditBadge;
