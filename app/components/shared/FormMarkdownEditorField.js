import React from 'react';
import classNames from 'classnames';
import autosize from 'autosize';
import MarkdownEditor from '../../lib/MarkdownEditor';
import AssetUploader from '../../lib/AssetUploader';
import Button from '../shared/Button';

class FormMarkdownEdtiorField extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    name: React.PropTypes.string,
    value: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    rows: React.PropTypes.number
  };

  state = {
    draggingFile: false
  };

  componentDidMount() {
    this.markdownEditor = new MarkdownEditor(this.textarea);
    this.assetUploader = new AssetUploader({ onAssetUploaded: this.handleAssetUploaded, onError: this.handleAssetUploadError });

    autosize(this.textarea);
  }

  componentWillUnmount() {
    autosize.destroy(this.textarea);

    delete this.markdownEditor;
    delete this.assetUploader;
  }

  render() {
    const containerClasses = classNames({ "has-success": this.state.draggingFile });

    if (this.state.error) {
      var errorNode = (
        <div className="mt2 mb2 border border-gray border-red p2 red rounded clearfix">
          <div className="col" style={{ position: "relative", top: "1px" }}>
            <i className="fa fa-warning mr2" />{this.state.error}
          </div>
          <div className="col-right">
            <button className="btn m0 p0" onClick={this.handleErrorDismissClick}><i className="fa fa-close"/></button>
          </div>
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <div className="mb2">
          <Button type="button" className="mr1" tabIndex={-1} onClick={this.handleBoldButtonClick} theme="default" outline={true}><i className="fa fa-bold" /></Button>
          <Button type="button" className="mr3" tabIndex={-1} onClick={this.handleItalicButtonClick} theme="default" outline={true}><i className="fa fa-italic" /></Button>
          <Button type="button" className="mr1" tabIndex={-1} onClick={this.handleQuoteButtonClick} theme="default" outline={true}><i className="fa fa-quote-right" /></Button>
          <Button type="button" className="mr1" tabIndex={-1} onClick={this.handleCodeButtonClick} theme="default" outline={true}><i className="fa fa-code" /></Button>
          <Button type="button" className="mr3" tabIndex={-1} onClick={this.handleLinkButtonClick} theme="default" outline={true}><i className="fa fa-link" /></Button>
          <Button type="button" className="mr1" tabIndex={-1} onClick={this.handleBulletedListButtonClick} theme="default" outline={true}><i className="fa fa-list" /></Button>
          <Button type="button" className="mr1" tabIndex={-1} onClick={this.handleNumberedListButtonClick} theme="default" outline={true}><i className="fa fa-list-ol" /></Button>
        </div>
        {errorNode}
        <textarea
          id={this.props.id}
          name={this.props.name}
          placeholder={this.props.placeholder}
          defaultValue={this.props.value}
          rows={this.props.rows}
          onFocus={this.handleOnFocus}
          onBlur={this.handleOnBlur}
          onChange={this.handleOnChange}
          onPaste={this.handleOnPaste}
          onDragEnter={this.handleOnDragEnter}
          onDragOver={this.handleOnDragOver}
          onDragLeave={this.handleOnDragLeave}
          onDrop={this.handleOnDrop}
          ref={(c) => this.textarea = c}
          style={{ overflowY: "hidden", resize: "vertical" }}
          className={"form-control"}
        />
      </div>
    );
  }

  _uploadFilesFromEvent(e) {
    const files = this.assetUploader.uploadFromEvent(e);

    // Were there any files uploaded in this event?
    if (files.length > 0) {
      // Since we've caught these files, we don't want the browser redirecting
      // to the file's location on the filesystem
      e.preventDefault();

      // Insert each of the files into the textarea
      files.forEach((file) => {
        const prefix = file.type.indexOf("image/") == 0 ? "!" : "";
        let text = prefix + "[Uploading " + file.name + "...]()";

        // If the input is currently in focus, insert the image where the users
        // cursor is.
        if (this.state.focused) {
          // If we're inserting the image at the end of a line with text, add a
          // new line before the insertion so it goes onto a new line.
          if (!this.markdownEditor.isCursorOnNewLine()) {
            text = "\n" + text;
          } else {
            text = text + "\n";
          }

          this.markdownEditor.insert(text);
        } else {
          // If there's something already in the textrea, add a new line and
          // add it to the bottom of the text.
          if (this.textarea.value.length > 0) {
            text = "\n" + text;
          }
          this.markdownEditor.append(text);
        }
      });

      autosize.update(this.textarea);
      this.textarea.focus();
    }
  }

  handleAssetUploaded = (file, url) => {
    // Replace the "uploading..." version of the file with the correct path
    this.markdownEditor.replace("[Uploading " + file.name + "...]()", "[" + file.name + "](" + url + ")");
  };

  handleAssetUploadError = (exception) => {
    this.setState({ error: exception.message });
  };

  handleErrorDismissClick = (e) => {
    e.preventDefault();

    this.setState({ error: null });
  };

  handleBoldButtonClick = (e) => {
    e.preventDefault();

    this.markdownEditor.bold();
    autosize.update(this.textarea);
    this.textarea.focus();
  };

  handleItalicButtonClick = (e) => {
    e.preventDefault();

    this.markdownEditor.italic();
    autosize.update(this.textarea);
    this.textarea.focus();
  };

  handleQuoteButtonClick = (e) => {
    e.preventDefault();

    this.markdownEditor.quote();
    autosize.update(this.textarea);
    this.textarea.focus();
  };

  handleNumberedListButtonClick = (e) => {
    e.preventDefault();

    this.markdownEditor.numberedList();
    autosize.update(this.textarea);
    this.textarea.focus();
  };

  handleBulletedListButtonClick = (e) => {
    e.preventDefault();

    this.markdownEditor.bulletedList();
    autosize.update(this.textarea);
    this.textarea.focus();
  };

  handleCodeButtonClick = (e) => {
    e.preventDefault();

    this.markdownEditor.code();
    autosize.update(this.textarea);
    this.textarea.focus();
  };

  handleLinkButtonClick = (e) => {
    e.preventDefault();

    this.markdownEditor.link();
    autosize.update(this.textarea);
    this.textarea.focus();
  };

  handleOnDragEnter = (e) => {
    if (this.assetUploader.doesEventContainFiles(e)) {
      this.setState({ draggingFile: true });
    }
  };

  handleOnDragOver = (e) => {
    // When you drag a file over a text area, the default browser behaviour
    // will show an insert caret at the cursor postition. Since there's no way
    // to get that caret, it doesn't make sense to show it, and then have to
    // insert the image at the end of the text area. So we'll just turn that
    // behaviour off.
    e.preventDefault();
  };

  handleOnDragLeave = () => {
    // We don't really need to check if there were files in the drag, we can
    // just turn off the state.
    this.setState({ draggingFile: false });
  };

  handleOnDrop = (e) => {
    // Drag leave won't fire on a drop, so we need to switch the state here
    // manually.
    this.setState({ draggingFile: false });

    this._uploadFilesFromEvent(e);
  };

  // Only available in Chrome
  handleOnPaste = (e) => {
    this._uploadFilesFromEvent(e);
  };

  handleOnChange = () => {
    autosize.update(this.textarea);
  };

  handleOnFocus = () => {
    this.setState({ focused: true });
  };

  handleOnBlur = () => {
    this.setState({ focused: false });
  };
}

export default FormMarkdownEdtiorField;
