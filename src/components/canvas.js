import React from 'react';

export default class Canvas extends React.Component {
  componentDidMount() {
    this.ctx = this.refs.canvas.getContext('2d');
    this.renderCanvas(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.renderCanvas(nextProps);
  }

  getPixelSize(props) {
    const { grid } = props;
    if (!grid.length) {
      return {
        height: 0, width: 0
      }
    }
    return {
      height: this.refs.canvas.height / grid.length,
      width: this.refs.canvas.width / grid[0].cells.length
    }
  }

  renderCanvas(props) {

    this.refs.canvas.width = this.props.size || 600;
    this.refs.canvas.height = this.props.size || 600;
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);

    const { grid } = props;
    if (!grid.length) {
      return <div />
    }
    const { height, width } = this.getPixelSize(props);
    for (let i = 0; i < grid.length; i += 1) {
      for (let j = 0; j < grid[i].cells.length; j += 1) {
        this.ctx.fillStyle = grid[i].cells[j];
        this.ctx.fillRect(j * width, i * height, width, height);
      }
    }
  }

  selectPoint(e) {
    const rect = e.target.getBoundingClientRect();
    const xSelected = e.clientX - rect.left;
    const ySelected = e.clientY - rect.top;

    const { height, width } = this.getPixelSize(this.props);
    return {
      x: Math.round(xSelected / width) + this.props.leftCorner.x,
      y: Math.round(ySelected / height) + this.props.leftCorner.y
    }
  }

  render() {
    return (
      <canvas
        ref='canvas' onClick={e => {
          this.props.onSelected(this.selectPoint(e))
        }} />
    );
  }
}