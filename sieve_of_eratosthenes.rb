module Sieve
  # See: https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html
  def self.primes(n)
    is_prime_at = [true] * (n + 1)
    
    2.upto(n) do |i|
      if i*i <= n && is_prime_at[i]
        ((i*i)..n).step(i) do |multiple|
          is_prime_at[multiple] = false
        end
      end
    end

    primes = []
    is_prime_at.filter_map.with_index {|is_prime, number| number if is_prime }
  end
end

p Sieve.primes(25)