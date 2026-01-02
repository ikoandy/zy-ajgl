// store/app.js
class Store {
  constructor() {
    this.state = {
      user: null,
      cases: [],
      clients: [],
      messages: [],
      notifications: []
    };
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  setUser(user) {
    this.setState({ user });
  }

  setCases(cases) {
    this.setState({ cases });
  }

  addCase(newCase) {
    this.setState({ cases: [...this.state.cases, newCase] });
  }

  updateCase(updatedCase) {
    const cases = this.state.cases.map(c => 
      c.id === updatedCase.id ? updatedCase : c
    );
    this.setState({ cases });
  }

  removeCase(caseId) {
    const cases = this.state.cases.filter(c => c.id !== caseId);
    this.setState({ cases });
  }
}

const store = new Store();

module.exports = store;
