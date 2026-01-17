const BaseModel = require('./BaseModel');

class DietAndFitness extends BaseModel {
  // Get all diet plans
  static async getAllDietPlans() {
    const query = 'SELECT * FROM diet_plans';
    return this.query(query);
  }

  // Get diet plan by health goal and dietary preference
  static async getDietPlan(healthGoal, dietaryPreference) {
    const query = 'SELECT * FROM diet_plans WHERE health_goal = ? AND dietary_preference = ?';
    return this.query(query, [healthGoal, dietaryPreference]);
  }

  // Get all workout plans
  static async getAllWorkoutPlans() {
    const query = 'SELECT * FROM workout_plans';
    return this.query(query);
  }

  // Get workout plan by health goal and fitness level
  static async getWorkoutPlan(healthGoal, fitnessLevel) {
    const query = 'SELECT * FROM workout_plans WHERE health_goal = ? AND fitness_level = ?';
    return this.query(query, [healthGoal, fitnessLevel]);
  }

  // Create a new diet plan
  static async createDietPlan(planData) {
    const { health_goal, dietary_preference, meal, suggestion, calories } = planData;
    const query = 'INSERT INTO diet_plans (health_goal, dietary_preference, meal, suggestion, calories) VALUES (?, ?, ?, ?, ?)';
    return this.execute(query, [health_goal, dietary_preference, meal, suggestion, calories]);
  }

  // Create a new workout plan
  static async createWorkoutPlan(planData) {
    const { health_goal, fitness_level, day, activity, focus } = planData;
    const query = 'INSERT INTO workout_plans (health_goal, fitness_level, day, activity, focus) VALUES (?, ?, ?, ?, ?)';
    return this.execute(query, [health_goal, fitness_level, day, activity, focus]);
  }

  // Update a diet plan
  static async updateDietPlan(id, planData) {
    const { health_goal, dietary_preference, meal, suggestion, calories } = planData;
    const query = 'UPDATE diet_plans SET health_goal = ?, dietary_preference = ?, meal = ?, suggestion = ?, calories = ? WHERE id = ?';
    return this.execute(query, [health_goal, dietary_preference, meal, suggestion, calories, id]);
  }

  // Update a workout plan
  static async updateWorkoutPlan(id, planData) {
    const { health_goal, fitness_level, day, activity, focus } = planData;
    const query = 'UPDATE workout_plans SET health_goal = ?, fitness_level = ?, day = ?, activity = ?, focus = ? WHERE id = ?';
    return this.execute(query, [health_goal, fitness_level, day, activity, focus, id]);
  }

  // Delete a diet plan
  static async deleteDietPlan(id) {
    const query = 'DELETE FROM diet_plans WHERE id = ?';
    return this.execute(query, [id]);
  }

  // Delete a workout plan
  static async deleteWorkoutPlan(id) {
    const query = 'DELETE FROM workout_plans WHERE id = ?';
    return this.execute(query, [id]);
  }
}

module.exports = DietAndFitness;