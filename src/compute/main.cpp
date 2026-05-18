/**
 * @file main.cpp
 * @brief Probabilistic FX Conversion Engine
 *
 * Computes currency conversion using a uniformly distributed exchange rate 
 * interval instead of a fixed scalar value.
 *
 * Usage: ./conversion <amount> <min_rate> <max_rate>
 * 
 * Arguments:
 *   amount    - The monetary value to convert (e.g. 100.0)
 *   min_rate  - Lower bound of the exchange rate range (e.g. 1.05)
 *   max_rate  - Upper bound of the exchange rate range (e.g. 1.15)
 *
 * Output:
 *   Prints "CONVERSION_RESULT: <value>" to stdout on success.
 *   Prints "ERROR: <message>" to stderr and exits with failure on bad input.
 * */

#include <cstdio>
#include <cstdlib>
#include <sstream>
#include <stdexcept>
#include <uxhw.h>

int main(int argc, char* argv[]) {
    if (argc < 4) {
        fprintf(stderr, "Usage: %s <amount> <min_rate> <max_rate>\n", argv[0]);
        return EXIT_FAILURE;
    }

    try {
        double amount, minRate, maxRate;
        
        std::stringstream ss1(argv[1]);
        if (!(ss1 >> amount)) throw std::runtime_error("Invalid amount");

        std::stringstream ss2(argv[2]);
        if (!(ss2 >> minRate)) throw std::runtime_error("Invalid min_rate");

        std::stringstream ss3(argv[3]);
        if (!(ss3 >> maxRate)) throw std::runtime_error("Invalid max_rate");

        double conversionRate = UxHwDoubleUniformDist(minRate, maxRate);
        double result = amount * conversionRate;

        printf("CONVERSION_RESULT: %lf\n", result);
    } catch (const std::exception& e) {
        fprintf(stderr, "ERROR: %s\n", e.what());
        exit(EXIT_FAILURE);
    }

    return EXIT_SUCCESS;
}