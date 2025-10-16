// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title LexipopMemoryNFT
 * @notice Free-to-mint NFT collection for Lexipop game memories on Base
 * @dev Each NFT contains an on-chain SVG with the 5 words from a game session
 */
contract LexipopMemoryNFT is ERC721 {
    using Strings for uint256;

    struct GameMemory {
        string[5] words;
        uint256 score;
        uint256 streak;
        uint256 timestamp;
        address player;
    }

    // Token ID counter
    uint256 private _tokenIdCounter;

    // Mapping from token ID to game memory
    mapping(uint256 => GameMemory) public gameMemories;

    // Mapping from player to their minted token IDs
    mapping(address => uint256[]) public playerTokens;

    // Events
    event MemoryMinted(
        uint256 indexed tokenId,
        address indexed player,
        uint256 score,
        uint256 streak
    );

    constructor() ERC721("Lexipop Memories", "LEXMEM") {
        _tokenIdCounter = 1; // Start from 1
    }

    /**
     * @notice Mint a new memory NFT (free, gas only)
     * @param words The 5 words from the game
     * @param score The player's score
     * @param streak The player's streak
     */
    function mintMemory(
        string[5] memory words,
        uint256 score,
        uint256 streak
    ) external {
        uint256 tokenId = _tokenIdCounter++;

        // Store the game memory
        gameMemories[tokenId] = GameMemory({
            words: words,
            score: score,
            streak: streak,
            timestamp: block.timestamp,
            player: msg.sender
        });

        // Track player's tokens
        playerTokens[msg.sender].push(tokenId);

        // Mint the NFT
        _safeMint(msg.sender, tokenId);

        emit MemoryMinted(tokenId, msg.sender, score, streak);
    }

    /**
     * @notice Generate the SVG image on-chain
     */
    function generateSVG(uint256 tokenId) internal view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        GameMemory memory memory = gameMemories[tokenId];

        // Determine primary gradient color based on score
        string memory primaryColor = getPrimaryColor(memory.score);

        // Build optimized SVG (shortened attributes for gas efficiency)
        bytes memory svg = abi.encodePacked(
            '<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">',
            '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">',
            '<stop offset="0" stop-color="', primaryColor, '" stop-opacity=".2"/>',
            '<stop offset="1" stop-color="',
            getSecondaryColor(memory.score),
            '" stop-opacity=".3"/>',
            '</linearGradient></defs>',
            '<rect width="600" height="600" fill="#fff"/>',
            '<rect width="600" height="600" fill="url(#bg)"/>',
            // Balloon emoji using Unicode hex
            '<text x="20" y="40" font-family="Arial" font-size="28" fill="#1a202c">&#x1F388;</text>',
            '<text x="580" y="40" font-family="Arial" font-size="20" font-weight="bold" fill="#1a202c" text-anchor="end">Lexipop</text>'
        );

        // Add words with consistent font size and lower positioning
        for (uint i = 0; i < 5; i++) {
            uint256 yPos = 170 + (i * 80);

            svg = abi.encodePacked(
                svg,
                '<text x="300" y="', yPos.toString(),
                '" font-family="Arial Black" font-size="48"',
                ' font-weight="900" fill="#1a202c" text-anchor="middle">',
                toUppercase(memory.words[i]),
                '</text>'
            );
        }

        svg = abi.encodePacked(svg, '</svg>');

        return string(svg);
    }

    /**
     * @notice Get the token URI with on-chain metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        GameMemory memory memory = gameMemories[tokenId];
        string memory svg = generateSVG(tokenId);
        string memory svgBase64 = Base64.encode(bytes(svg));

        // Build attributes array
        string memory attributes = string(abi.encodePacked(
            '[{"trait_type":"Score","value":', memory.score.toString(), '},',
            '{"trait_type":"Streak","value":', memory.streak.toString(), '},',
            '{"trait_type":"Perfect Game","value":"', memory.score >= 500 ? 'Yes' : 'No', '"},',
            '{"trait_type":"Timestamp","value":', memory.timestamp.toString(), '}]'
        ));

        // Build metadata JSON
        string memory json = Base64.encode(
            bytes(
                string(abi.encodePacked(
                    '{"name":"Lexipop Memory #', tokenId.toString(),
                    '","description":"Words mastered: ', memory.words[0], ', ', memory.words[1],
                    ', ', memory.words[2], ', ', memory.words[3], ', ', memory.words[4],
                    '. Score: ', memory.score.toString(), ' points',
                    memory.streak > 1 ? string(abi.encodePacked(' with a ', memory.streak.toString(), ' day streak!')) : '.',
                    '","image":"data:image/svg+xml;base64,', svgBase64,
                    '","attributes":', attributes, '}'
                ))
            )
        );

        return string(abi.encodePacked('data:application/json;base64,', json));
    }

    /**
     * @notice Check if a token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return gameMemories[tokenId].timestamp != 0;
    }

    /**
     * @notice Get all tokens owned by a player
     */
    function getPlayerTokens(address player) external view returns (uint256[] memory) {
        return playerTokens[player];
    }

    /**
     * @notice Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    /**
     * @notice Convert string to uppercase (simplified for known word set)
     */
    function toUppercase(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bUpper = new bytes(bStr.length);

        for (uint i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 97) && (uint8(bStr[i]) <= 122)) {
                bUpper[i] = bytes1(uint8(bStr[i]) - 32);
            } else {
                bUpper[i] = bStr[i];
            }
        }

        return string(bUpper);
    }

    /**
     * Get primary gradient color based on score (gas optimized)
     */
    function getPrimaryColor(uint256 score) internal pure returns (string memory) {
        if (score >= 500) return "#FFD700"; // Gold
        if (score >= 400) return "#B794F4"; // Purple
        if (score >= 300) return "#4FD1C5"; // Teal
        if (score >= 200) return "#68D391"; // Green
        return "#90CDF4"; // Blue
    }

    /**
     * Get secondary gradient color based on score (gas optimized)
     */
    function getSecondaryColor(uint256 score) internal pure returns (string memory) {
        if (score >= 500) return "#FFA500"; // Gold
        if (score >= 400) return "#9F7AEA"; // Purple
        if (score >= 300) return "#38B2AC"; // Teal
        if (score >= 200) return "#48BB78"; // Green
        return "#63B3ED"; // Blue
    }

    /**
     * Calculate font size based on word length (gas optimized, larger fonts)
     */
    function getFontSize(uint256 wordLength) internal pure returns (uint256) {
        if (wordLength > 12) return 44;
        if (wordLength > 10) return 50;
        if (wordLength > 8) return 56;
        return 62;
    }
}