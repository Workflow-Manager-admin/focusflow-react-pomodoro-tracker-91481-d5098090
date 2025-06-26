import supabase from "./supabaseClient";
import { createTask } from "./supabaseExamples";

// TEST for createTask: It should require user_id from authenticated user
describe("createTask", () => {
  it("should throw error if userId is missing", async () => {
    await expect(createTask(undefined, "Should error")).rejects.toThrow(
      /No authenticated user/
    );
    await expect(createTask("", "Should error")).rejects.toThrow(
      /No authenticated user/
    );
  });

  // This test requires a valid Supabase user session
  it("should insert a task with correct user_id if authenticated", async () => {
    // Needs a test user log in – SKIP if no session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return; // skip if not logged in

    const userId = session.user.id;
    const uniqueTitle = "Test task " + Math.random();
    const result = await createTask(userId, uniqueTitle);
    expect(result).toBeDefined();
    expect(result.user_id).toBe(userId);
    expect(result.title).toBe(uniqueTitle);

    // Clean up
    await supabase.from("tasks").delete().eq("id", result.id);
  });
});
