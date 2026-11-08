package com.mvjce.eventmanagement;

import com.mvjce.eventmanagement.controller.AdminController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;

public class ClubAdminPasswordGenerationTest {

    private final AdminController adminController = new AdminController();

    private String invokeExtractFirstName(String fullName) throws Exception {
        Method method = AdminController.class.getDeclaredMethod("extractFirstName", String.class);
        method.setAccessible(true);
        return (String) method.invoke(adminController, fullName);
    }

    private String invokeExtractLast4DigitsOfPhone(String mobile) throws Exception {
        Method method = AdminController.class.getDeclaredMethod("extractLast4DigitsOfPhone", String.class);
        method.setAccessible(true);
        return (String) method.invoke(adminController, mobile);
    }

    @Test
    @DisplayName("Should extract first name correctly ignoring title prefixes")
    void testExtractFirstNameWithTitles() throws Exception {
        assertEquals("Rajesh", invokeExtractFirstName("Dr. Rajesh Kumar"));
        assertEquals("Anitha", invokeExtractFirstName("Prof. Anitha Rao"));
        assertEquals("Suresh", invokeExtractFirstName("Mr. Suresh K"));
        assertEquals("Deepa", invokeExtractFirstName("Mrs. Deepa Sharma"));
        assertEquals("Pooja", invokeExtractFirstName("Ms. Pooja Verma"));
        assertEquals("Karthik", invokeExtractFirstName("Er. Karthik M"));
        assertEquals("Vikram", invokeExtractFirstName("Dr Vikram S"));
        assertEquals("Ramesh", invokeExtractFirstName("Professor Ramesh Gupta"));
        assertEquals("Venkatesh", invokeExtractFirstName("Shri Venkatesh"));
        assertEquals("Kavitha", invokeExtractFirstName("Kavitha Nayak"));
    }

    @Test
    @DisplayName("Should extract exactly last 4 digits of phone number ignoring formatting")
    void testExtractLast4DigitsOfPhone() throws Exception {
        assertEquals("3210", invokeExtractLast4DigitsOfPhone("9876543210"));
        assertEquals("6655", invokeExtractLast4DigitsOfPhone("9988776655"));
        assertEquals("4321", invokeExtractLast4DigitsOfPhone("+91 98765 44321"));
        assertEquals("7890", invokeExtractLast4DigitsOfPhone("+91-9876-547-890"));
        assertEquals("5678", invokeExtractLast4DigitsOfPhone("(080) 1234-5678"));
    }

    @Test
    @DisplayName("Should reject phone numbers with less than 4 digits")
    void testInvalidPhoneNumbers() {
        assertThrows(Exception.class, () -> invokeExtractLast4DigitsOfPhone("123"));
        assertThrows(Exception.class, () -> invokeExtractLast4DigitsOfPhone("abc"));
        assertThrows(Exception.class, () -> invokeExtractLast4DigitsOfPhone(""));
        assertThrows(Exception.class, () -> invokeExtractLast4DigitsOfPhone(null));
    }

    @Test
    @DisplayName("Full password generation verification matching specifications")
    void testFullPasswordGeneration() throws Exception {
        // Dr. Rajesh Kumar + 9876543210 -> Rajesh@3210
        String p1 = invokeExtractFirstName("Dr. Rajesh Kumar") + "@" + invokeExtractLast4DigitsOfPhone("9876543210");
        assertEquals("Rajesh@3210", p1);

        // Prof. Anitha Rao + 9988776655 -> Anitha@6655
        String p2 = invokeExtractFirstName("Prof. Anitha Rao") + "@" + invokeExtractLast4DigitsOfPhone("9988776655");
        assertEquals("Anitha@6655", p2);

        // Mr. Ramesh + +91 98765 43210 -> Ramesh@3210
        String p3 = invokeExtractFirstName("Mr. Ramesh") + "@" + invokeExtractLast4DigitsOfPhone("+91 98765 43210");
        assertEquals("Ramesh@3210", p3);
    }
}
