//
//  CUTERentCityViewController.m
//  currant
//
//  Created by Foster Yin on 6/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentCityViewController.h"
#import "CUTEUIMacro.h"
#import "SVProgressHUD+CUTEAPI.h"

@interface CUTERentCityViewController ()
{
    FXFormField *_field;
}

@property (nonatomic, retain) NSArray *sections;

@end

@implementation CUTERentCityViewController
@synthesize field = _field;

- (void)viewDidLoad {
    [super viewDidLoad];
    self.tableView.rowHeight = CUTE_CELL_DEFAULT_HEIGHT;
    
    NSInteger count = self.field.optionCount;
    if (count > 0) {
        [SVProgressHUD show];
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^(void) {

            SEL selector = @selector(localizedTitle);
            NSInteger sectionTitlesCount = [[[UILocalizedIndexedCollation currentCollation] sectionTitles] count];

            NSMutableArray *mutableSections = [[NSMutableArray alloc] initWithCapacity:sectionTitlesCount];
            for (NSUInteger idx = 0; idx < sectionTitlesCount; idx++) {
                [mutableSections addObject:[NSMutableArray array]];
            }

            for (int i = 0; i < count; i++)
            {
                id object = [self.field optionAtIndex:i];
                NSInteger sectionNumber = [[UILocalizedIndexedCollation currentCollation] sectionForObject:object collationStringSelector:selector];
                [[mutableSections objectAtIndex:sectionNumber] addObject:object];
            }

//            for (NSUInteger idx = 0; idx < sectionTitlesCount; idx++) {
//                NSArray *objectsForSection = [mutableSections objectAtIndex:idx];
//                [mutableSections replaceObjectAtIndex:idx withObject:[[UILocalizedIndexedCollation currentCollation] sortedArrayFromArray:objectsForSection collationStringSelector:selector]];
//            }

            dispatch_async(dispatch_get_main_queue(), ^(void) {
                self.sections = mutableSections;
                [self.tableView reloadData];
                [SVProgressHUD dismiss];
            });
        });
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

#pragma mark - Table view data source

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return [[self.sections objectAtIndex:section] count];
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return self.sections.count;
}

- (NSString *)tableView:(UITableView *)tableView
titleForHeaderInSection:(NSInteger)section
{
    return [[[UILocalizedIndexedCollation currentCollation] sectionTitles] objectAtIndex:section];
}

- (NSArray *)sectionIndexTitlesForTableView:(UITableView *)tableView {
    return [[UILocalizedIndexedCollation currentCollation] sectionIndexTitles];
}

- (NSInteger)tableView:(UITableView *)tableView
sectionForSectionIndexTitle:(NSString *)title
               atIndex:(NSInteger)index
{
    return [[UILocalizedIndexedCollation currentCollation] sectionForSectionIndexTitleAtIndex:index];
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return CUTE_CELL_DEFAULT_HEIGHT;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"cell"];
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"cell"];
    }
    cell.textLabel.text = [[self.sections[indexPath.section] objectAtIndex:indexPath.row] fieldDescription];
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    self.field.value = self.sections[indexPath.section][indexPath.row];
    self.field.action(self);
    [tableView deselectRowAtIndexPath:tableView.indexPathForSelectedRow animated:YES];
}

@end
