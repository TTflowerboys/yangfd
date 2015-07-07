//
//  KIFUITestActor+FilePath.m
//  currant
//
//  Created by Foster Yin on 7/7/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "KIFUITestActor+FilePath.h"

@implementation KIFUITestActor (FilePath)

- (NSString *)getFileContentWithFileName:(NSString *)fileName {
    NSString *filePath = [[NSBundle bundleForClass:self.class] pathForResource:[fileName stringByDeletingPathExtension] ofType:[fileName pathExtension]];
    NSString *fileContent = [NSString stringWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:nil];
    return fileContent;
}

@end
