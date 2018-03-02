import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import LoadingScreen from 'ui-elements/LoadingScreen';
import OutlineButton from 'ui-elements/OutlineButton';

import BasicInformationPanel from './BasicInformationPanel';
import ExternalLinkPanel from './ExternalLinkPanel';

import * as Actions from '../Profile.actions';


@connect(store => ({
  user: store.Profile.userProfile,
}))
@translate(['general', 'Profile'])
export default class PersonalInformationTab extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    user: PropTypes.object,
  }

  constructor(props) {
    super(props);

    const { user } = props;
    const { avatar } = user;

    this.state = {
      avatar,
    };
  }

  handleAvatarUploadOnChange = ({ target }) => {
    const imageFiles = [];
    Array.prototype.push.apply(imageFiles, target.files);
    const avatarToBeUpload = imageFiles[0];
    this.props.dispatch(Actions.updateUser({ avatar: avatarToBeUpload }));
    const fileReader = new FileReader();
    if (avatarToBeUpload) {
      fileReader.readAsDataURL(avatarToBeUpload);
      fileReader.onload = (event) => {
        this.setState({ avatar: event.target.result });
      };
    }
  }

  renderProfileHeader() {
    const { t } = this.props;
    const { avatar } = this.state;
    return (
      <div id="profile-setting-header">
        <div className="profile-picture">
          <input
            ref={ref => this.avatarUpload = ref}
            accept="image/*"
            style={{ display: 'none' }}
            type="file"
            onChange={this.handleAvatarUploadOnChange}
            onClick={() => { this.avatarUpload.value = ''; }} // Clear selected files
          />
          <img
            alt="profile avatar"
            className="profile-icon"
            src={avatar || '/static/img/avatar.jpg'}
          />
        </div>
        <OutlineButton
          color={'light-grey'}
          label={t('personalInformation.button.editProfilePicture')}
          onClick={() => this.avatarUpload && this.avatarUpload.click()}
        />
      </div>
    );
  }

  render() {
    const { t } = this.props;
    return (
      <div id="personal-information-container">
        {this.renderProfileHeader()}
        <div className="profile-panels">
          <BasicInformationPanel />
          <ExternalLinkPanel />
        </div>
      </div>
    );
  }
}
