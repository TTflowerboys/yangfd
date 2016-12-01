//
//  CUTERentCityViewController.m
//  currant
//
//  Created by Foster Yin on 6/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormFieldOptionViewController.h"
#import "CUTEUIMacro.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTECommonMacro.h"
#import "CUTEStringMatcher.h"

@interface CUTEFormFieldOptionViewController () <UISearchBarDelegate, UISearchControllerDelegate, UISearchResultsUpdating>
{
    FXFormField *_field;

    UISearchController *_searchController;
}

@property (nonatomic, retain) NSArray *sections;

@property (nonatomic, strong) NSArray *rawResults;

@property (nonatomic, strong) NSArray *filterResults;


@end

@implementation CUTEFormFieldOptionViewController
@synthesize field = _field;

- (void)viewDidLoad {
    [super viewDidLoad];
    self.tableView.rowHeight = CUTE_CELL_DEFAULT_HEIGHT;

    _searchController = [[UISearchController alloc] initWithSearchResultsController:nil];
    _searchController.delegate = self;
    _searchController.searchResultsUpdater = self;
    _searchController.searchBar.delegate = self;
    self.tableView.tableHeaderView = _searchController.searchBar;
    _searchController.searchBar.tintColor = CUTE_BAR_COLOR;
    _searchController.hidesNavigationBarDuringPresentation = YES;
    //http://stackoverflow.com/questions/28373733/uisearchcontroller-in-a-uitableviewcontroller-rows-not-selectable-and-table-view
    _searchController.dimsBackgroundDuringPresentation = NO;
    self.definesPresentationContext = YES;


    NSInteger count = self.field.optionCount;
    if (count > 0) {
        [SVProgressHUD show];
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^(void) {

            SEL selector = NSSelectorFromString(@"localizedTitle");
            NSInteger sectionTitlesCount = [[[UILocalizedIndexedCollation currentCollation] sectionTitles] count];

            NSMutableArray *mutableSections = [[NSMutableArray alloc] initWithCapacity:sectionTitlesCount];
            NSMutableArray *rawResults = [NSMutableArray array];
            for (NSUInteger idx = 0; idx < sectionTitlesCount; idx++) {
                [mutableSections addObject:[NSMutableArray array]];
            }

            for (int i = 0; i < count; i++)
            {
                id object = [self.field optionAtIndex:i];
                NSInteger sectionNumber = [[UILocalizedIndexedCollation currentCollation] sectionForObject:object collationStringSelector:selector];
                [[mutableSections objectAtIndex:sectionNumber] addObject:object];
                [rawResults addObject:object];
            }

//            for (NSUInteger idx = 0; idx < sectionTitlesCount; idx++) {
//                NSArray *objectsForSection = [mutableSections objectAtIndex:idx];
//                [mutableSections replaceObjectAtIndex:idx withObject:[[UILocalizedIndexedCollation currentCollation] sortedArrayFromArray:objectsForSection collationStringSelector:selector]];
//            }

            dispatch_async(dispatch_get_main_queue(), ^(void) {
                self.sections = mutableSections;
                self.rawResults = rawResults;
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
    if (_searchController.active) {
        return self.filterResults.count;
    }

    return [[self.sections objectAtIndex:section] count];
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    if (_searchController.active) {
        return 1;
    }
    return self.sections.count;
}

- (NSString *)tableView:(UITableView *)tableView
titleForHeaderInSection:(NSInteger)section
{
    if (_searchController.active) {
        return nil;
    }
    return [[[UILocalizedIndexedCollation currentCollation] sectionTitles] objectAtIndex:section];
}

- (NSArray *)sectionIndexTitlesForTableView:(UITableView *)tableView {
    if (_searchController.active) {
        return nil;
    }
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
    if (_searchController.active) {
        cell.textLabel.text = [[self.filterResults objectAtIndex:indexPath.row] fieldDescription];
    }
    else {
        cell.textLabel.text = [[self.sections[indexPath.section] objectAtIndex:indexPath.row] fieldDescription];
    }

    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    if (_searchController.active) {
        self.field.value = self.filterResults[indexPath.row];
    }
    else {

        self.field.value = self.sections[indexPath.section][indexPath.row];
    }

    self.field.action(self);
    [tableView deselectRowAtIndexPath:tableView.indexPathForSelectedRow animated:YES];
}

#pragma - mark UISearchBarDelegate

- (void)searchBar:(UISearchBar *)searchBar textDidChange:(NSString *)searchText {

}

- (void)searchBarTextDidBeginEditing:(UISearchBar *)searchBar {

}

#pragma - mark UISearchResultsUpdating

- (void)updateSearchResultsForSearchController:(UISearchController *)searchController {

    NSPredicate *predicate = [NSPredicate predicateWithFormat:@"SELF.fieldDescription contains[c] %@", searchController.searchBar.text];
    self.filterResults = [self.rawResults filteredArrayUsingPredicate:predicate];
    [self.tableView reloadData];
}

@end
