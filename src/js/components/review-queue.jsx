/** @jsx React.DOM */
var Link = require('react-router-component').Link

var ReviewQueue = React.createClass({
  render: function render () {
    var props = this.props;
    return <div>
      {this.renderStudents(props.studentHash)}
    </div>;
  },

  renderStudents: function renderStudents (studentHash) {
    ret = []
    for (var student in studentHash) {
      var val = studentHash[student];

      ret.push(
        <div key={Math.random()}>
          <h4 className="subheader">{val.user.first_name} {val.user.last_name}:</h4>
          <ul className="small-block-grid-6">
            {this.renderBadges(val)}
          </ul>
        </div>
      );
    }

    return ret;
  },

  renderBadges: function renderBadges (relationInfo) {
    var self = this;
    return _.map(relationInfo.badges, function (badge) {
      return self.renderBadge(relationInfo.user, badge);
    });
  },

  renderBadge: function renderBadge (user, badge) {
    var badgeId = badge.badge_id.toS();
    var name = user.first_name + ' ' + user.last_name;
    var pathToBadge = 'https://3501-training-2014-us-west-2.s3'
      + '.amazonaws.com/badges/' + badgeId + '.jpg';

    return <li key={badgeId}>
      <Link href={'/badge/' + badgeId + '/assign?search=' + name} >
        <Image width={300} src={pathToBadge} className="badge" aspectRatio={1} />
      </Link>
    </li>;
  },

});

module.exports = ReviewQueue;
