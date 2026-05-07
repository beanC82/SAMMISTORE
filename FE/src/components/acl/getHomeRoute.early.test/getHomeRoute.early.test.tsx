import '@testing-library/react'
import getHomeRoute from '../getHomeRoute';
import "@testing-library/jest-dom";

// Import necessary libraries
// Import necessary libraries
// Mock any React components or hooks if necessary
// Since getHomeRoute is a simple function and doesn't use React components or hooks, no mocks are needed here

describe('getHomeRoute() getHomeRoute method', () => {
    // Happy Path Tests
    describe('Happy Paths', () => {
        it('should return "/acl" when the role is "client"', () => {
            // Test description: This test checks if the function returns the correct route for the "client" role.
            const role = 'client';
            const expectedRoute = '/acl';
            const result = getHomeRoute(role);
            expect(result).toBe(expectedRoute);
        });

        it('should return "/dashboards/analytics" when the role is not "client"', () => {
            // Test description: This test checks if the function returns the default route for roles other than "client".
            const role = 'admin';
            const expectedRoute = '/dashboards/analytics';
            const result = getHomeRoute(role);
            expect(result).toBe(expectedRoute);
        });
    });

    // Edge Case Tests
    describe('Edge Cases', () => {
        it('should return "/dashboards/analytics" when the role is an empty string', () => {
            // Test description: This test checks if the function handles an empty string role correctly.
            const role = '';
            const expectedRoute = '/dashboards/analytics';
            const result = getHomeRoute(role);
            expect(result).toBe(expectedRoute);
        });

        it('should return "/dashboards/analytics" when the role is undefined', () => {
            // Test description: This test checks if the function handles an undefined role correctly.
            const role = undefined as unknown as string;
            const expectedRoute = '/dashboards/analytics';
            const result = getHomeRoute(role);
            expect(result).toBe(expectedRoute);
        });

        it('should return "/dashboards/analytics" when the role is null', () => {
            // Test description: This test checks if the function handles a null role correctly.
            const role = null as unknown as string;
            const expectedRoute = '/dashboards/analytics';
            const result = getHomeRoute(role);
            expect(result).toBe(expectedRoute);
        });

        it('should return "/dashboards/analytics" when the role is a number', () => {
            // Test description: This test checks if the function handles a numeric role correctly.
            const role = 123 as unknown as string;
            const expectedRoute = '/dashboards/analytics';
            const result = getHomeRoute(role);
            expect(result).toBe(expectedRoute);
        });

        it('should return "/dashboards/analytics" when the role is an object', () => {
            // Test description: This test checks if the function handles an object role correctly.
            const role = {} as unknown as string;
            const expectedRoute = '/dashboards/analytics';
            const result = getHomeRoute(role);
            expect(result).toBe(expectedRoute);
        });
    });
});