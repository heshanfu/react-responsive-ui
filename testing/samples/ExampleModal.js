window.ExampleModal = React.createClass
({
	getInitialState() { return {} },

	render()
	{
		return (
			<Example name="modal" title="Modal">

								<Button
									action={() => this.setState({ show_modal: true })}>
									Show
								</Button>

{/*
	closeButtonIcon={true}
	closeLabel="x"
*/}
								<Modal
									isOpen={this.state.show_modal}
									close={() => this.setState({ show_modal: false })}
									style={{ maxWidth : '40em' }}>

									<Modal.Title>
										An example modal
									</Modal.Title>

									<Modal.Content>
										<p style={{ marginTop: 0, marginBottom: '1.35em' }}>
											На этом этапе электрификации все потребители электроэнергии (каковыми являлись исключительно осветительные приборы) использовали постоянный ток, и существовали определенные проблемы с передачей электроэнергии на значительные расстояния. Вследствие этого источник электроэнергии располагался в непосредственной близости от потребителя. Так, например, в&nbsp;случае с Киевскими железнодорожными мастерскими каждый из четырех фонарей имел свою электромагнитную машину Грамма.
										</p>

										<p style={{ marginTop: '1.35em', marginBottom: '1.35em' }}>
											На этом этапе электрификации все потребители электроэнергии (каковыми являлись исключительно осветительные приборы) использовали постоянный ток, и существовали определенные проблемы с передачей электроэнергии на значительные расстояния. Вследствие этого источник электроэнергии располагался в непосредственной близости от потребителя. Так, например, в&nbsp;случае с Киевскими железнодорожными мастерскими каждый из четырех фонарей имел свою электромагнитную машину Грамма.
										</p>

										<p style={{ marginTop: '1.35em', marginBottom: '1.35em' }}>
											На этом этапе электрификации все потребители электроэнергии (каковыми являлись исключительно осветительные приборы) использовали постоянный ток, и существовали определенные проблемы с передачей электроэнергии на значительные расстояния. Вследствие этого источник электроэнергии располагался в непосредственной близости от потребителя. Так, например, в&nbsp;случае с Киевскими железнодорожными мастерскими каждый из четырех фонарей имел свою электромагнитную машину Грамма.
										</p>

										<p style={{ marginTop: '1.35em', marginBottom: '1.35em' }}>
											На этом этапе электрификации все потребители электроэнергии (каковыми являлись исключительно осветительные приборы) использовали постоянный ток, и существовали определенные проблемы с передачей электроэнергии на значительные расстояния. Вследствие этого источник электроэнергии располагался в непосредственной близости от потребителя. Так, например, в&nbsp;случае с Киевскими железнодорожными мастерскими каждый из четырех фонарей имел свою электромагнитную машину Грамма.
										</p>

										<p style={{ marginTop: '1.35em', marginBottom: 0 }}>
											На этом этапе электрификации все потребители электроэнергии (каковыми являлись исключительно осветительные приборы) использовали постоянный ток, и существовали определенные проблемы с передачей электроэнергии на значительные расстояния. Вследствие этого источник электроэнергии располагался в непосредственной близости от потребителя. Так, например, в&nbsp;случае с Киевскими железнодорожными мастерскими каждый из четырех фонарей имел свою электромагнитную машину Грамма.
										</p>
									</Modal.Content>

									<Modal.Actions>
										<Button
											action={ () => this.setState({ show_modal: false }) }>
											Hide
										</Button>
									</Modal.Actions>
								</Modal>

<Highlight lang="jsx">{`
<Button action={() => this.setState({ showModal: true })}>
  Show
</Button>

<Modal
  isOpen={this.state.showModal}
  close={() => this.setState({ showModal: false })}>

  <Modal.Title>
    An example modal
  <Modal.Title>

  <Modal.Content>
    ...
  </Modal.Content>

  <Modal.Actions>
    <Button action={() => this.setState({ showModal: false })}>
      Hide
    </Button>
  </Modal.Actions>
</Modal>
`}</Highlight>

<Highlight lang="css">{`
.rrui__modal__content {
  background-color : white;
}
.rrui__modal__content-body {
  margin : 20px;
}
`}</Highlight>

<code className="colored">{'<Modal/>'}</code> also takes optional properties:

<ul className="list">
	<li><code className="colored">closeButtonIcon</code> property which can either be <code className="colored">true</code> for a default "cross" icon or a custom <code className="colored">React.Component</code>.</li>

	<li><code className="colored">closeLabel</code> property in which case a default "Close" button is added to <code className="colored">{'<Modal.Actions/>'}</code> (if <code className="colored">closeButtonIcon</code> property wasn't passed).</li>
</ul>

			</Example>
		)
	}
})