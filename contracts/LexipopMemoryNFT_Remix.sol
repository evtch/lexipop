// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title Lexipop Words
 * @notice NFT collection for Lexipop Words
 * @dev NFT contains an on-chain SVG with 5 Lexipop words
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

    uint256 private _tokenIdCounter;
    mapping(uint256 => GameMemory) public gameMemories;
    mapping(address => uint256[]) public playerTokens;

    event MemoryMinted(
        uint256 indexed tokenId,
        address indexed player,
        uint256 score,
        uint256 streak
    );

    constructor() ERC721("Lexipop Words", "LEXIWORD") {
        _tokenIdCounter = 1;
    }

    /**
     * @notice Mint Lexipop NFT
     */
    function mintMemory(
        string[5] memory words,
        uint256 score,
        uint256 streak
    ) external {
        uint256 tokenId = _tokenIdCounter++;

        gameMemories[tokenId] = GameMemory({
            words: words,
            score: score,
            streak: streak,
            timestamp: block.timestamp,
            player: msg.sender
        });

        playerTokens[msg.sender].push(tokenId);
        _safeMint(msg.sender, tokenId);

        emit MemoryMinted(tokenId, msg.sender, score, streak);
    }

    /**
     * @notice Generate optimized SVG on-chain
     */
    function generateSVG(uint256 tokenId) internal view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        GameMemory memory gameMemory = gameMemories[tokenId];
        string memory primaryColor = getPrimaryColor(gameMemory.score);

        // Optimized SVG with shortened attributes
        bytes memory svg = abi.encodePacked(
            '<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">',
            '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">',
            '<stop offset="0" stop-color="', primaryColor, '" stop-opacity=".2"/>',
            '<stop offset="1" stop-color="',
            getSecondaryColor(gameMemory.score),
            '" stop-opacity=".3"/>',
            '</linearGradient></defs>',
            '<rect width="600" height="600" fill="#fff"/>',
            '<rect width="600" height="600" fill="url(#bg)"/>',
            '<text x="20" y="40" font-family="Arial" font-size="28" fill="#1a202c">&#x1F388;</text>',
            '<text x="580" y="40" font-family="Arial" font-size="20" font-weight="bold" fill="#1a202c" text-anchor="end">Lexipop</text>'
        );

        // Add words with consistent Arial Black font
        for (uint i = 0; i < 5; i++) {
            uint256 yPos = 170 + (i * 80);
            svg = abi.encodePacked(
                svg,
                '<text x="300" y="', yPos.toString(),
                '" font-family="Arial Black" font-size="48"',
                ' font-weight="900" fill="#1a202c" text-anchor="middle">',
                toUppercase(gameMemory.words[i]),
                '</text>'
            );
        }

        return string(abi.encodePacked(svg, '</svg>'));
    }

    /**
     * @notice Get token metadata with on-chain SVG
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        GameMemory memory gameMemory = gameMemories[tokenId];
        string memory svg = generateSVG(tokenId);
        string memory svgBase64 = Base64.encode(bytes(svg));

        string memory attributes = string(abi.encodePacked(
            '[{"trait_type":"Score","value":', gameMemory.score.toString(), '},',
            '{"trait_type":"Streak","value":', gameMemory.streak.toString(), '},',
            '{"trait_type":"Perfect Game","value":"', gameMemory.score >= 500 ? 'Yes' : 'No', '"},',
            '{"trait_type":"Timestamp","value":', gameMemory.timestamp.toString(), '}]'
        ));

        string memory json = Base64.encode(
            bytes(
                string(abi.encodePacked(
                    '{"name":"Lexipop Memory #', tokenId.toString(),
                    '","description":"Words mastered: ', gameMemory.words[0], ', ', gameMemory.words[1],
                    ', ', gameMemory.words[2], ', ', gameMemory.words[3], ', ', gameMemory.words[4],
                    '. Score: ', gameMemory.score.toString(), ' points',
                    gameMemory.streak > 1 ? string(abi.encodePacked(' with a ', gameMemory.streak.toString(), ' day streak!')) : '.',
                    '","image":"data:image/svg+xml;base64,', svgBase64,
                    '","attributes":', attributes, '}'
                ))
            )
        );

        return string(abi.encodePacked('data:application/json;base64,', json));
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return gameMemories[tokenId].timestamp != 0;
    }

    function getPlayerTokens(address player) external view returns (uint256[] memory) {
        return playerTokens[player];
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }

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

    function getPrimaryColor(uint256 score) internal pure returns (string memory) {
        if (score >= 500) return "#FFD700"; // Gold
        if (score >= 400) return "#B794F4"; // Purple
        if (score >= 300) return "#4FD1C5"; // Teal
        if (score >= 200) return "#68D391"; // Green
        return "#90CDF4"; // Blue
    }

    function getSecondaryColor(uint256 score) internal pure returns (string memory) {
        if (score >= 500) return "#FFA500"; // Gold
        if (score >= 400) return "#9F7AEA"; // Purple
        if (score >= 300) return "#38B2AC"; // Teal
        if (score >= 200) return "#48BB78"; // Green
        return "#63B3ED"; // Blue
    }
}